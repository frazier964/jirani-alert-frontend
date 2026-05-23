const { execSync, spawnSync } = require('child_process')
const path = require('path')
const isWindows = process.platform === 'win32'

const knownPorts = [4021, 9198, 8181, 4400, 4500, 9150]

function getPidsFromWindows() {
  try {
    const command = [
      'powershell',
      '-NoProfile',
      '-Command',
      "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match 'firebase(\\.js)?.*emulators:start' -or $_.CommandLine -match 'cloud-firestore-emulator' } | Select-Object -ExpandProperty ProcessId",
    ]
    const output = execSync(command.join(' '), { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' })
    return output
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line !== '' && /^\d+$/.test(line))
      .map(Number)
  } catch (error) {
    return []
  }
}

function getPidsFromWindowsPorts() {
  try {
    const ports = knownPorts.join(',')
    const command = [
      'powershell',
      '-NoProfile',
      '-Command',
      `Get-NetTCPConnection -LocalPort ${ports} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | Sort-Object -Unique`,
    ]
    const output = execSync(command.join(' '), { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' })
    return output
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line !== '' && /^\d+$/.test(line))
      .map(Number)
  } catch (error) {
    return []
  }
}

function getPidsFromUnix() {
  try {
    const output = execSync("ps -eo pid,args | grep -E 'firebase(.js)?.*emulators:start|cloud-firestore-emulator' | grep -v grep", {
      stdio: ['ignore', 'pipe', 'pipe'],
      encoding: 'utf8',
    })
    return output
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => Number(line.split(/\s+/)[0]))
      .filter(Number.isFinite)
  } catch (error) {
    return []
  }
}

function getPidsFromUnixPorts() {
  try {
    const portsPattern = knownPorts.join('|')
    const output = execSync(`lsof -nP -iTCP -sTCP:LISTEN | grep -E '(:${portsPattern})( |$)' | awk '{print $2}' | sort -u`, {
      stdio: ['ignore', 'pipe', 'pipe'],
      encoding: 'utf8',
    })
    return output
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line !== '' && /^\d+$/.test(line))
      .map(Number)
  } catch (error) {
    return []
  }
}

function getBlockedPortsFromWindows() {
  try {
    const command = [
      'powershell',
      '-NoProfile',
      '-Command',
      `Get-NetTCPConnection -LocalPort ${knownPorts.join(',')} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty LocalPort | Sort-Object -Unique`,
    ]
    const output = execSync(command.join(' '), { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' })
    return output
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line !== '' && /^\d+$/.test(line))
      .map(Number)
  } catch (error) {
    return []
  }
}

function getBlockedPortsFromUnix() {
  try {
    const portsPattern = knownPorts.join('|')
    const output = execSync(`lsof -nP -iTCP -sTCP:LISTEN | grep -E '(:${portsPattern})( |$)' | awk '{print $9}' | sed -E 's/.*:(\\d+)$/\\1/' | sort -u`, {
      stdio: ['ignore', 'pipe', 'pipe'],
      encoding: 'utf8',
    })
    return output
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line !== '' && /^\d+$/.test(line))
      .map(Number)
  } catch (error) {
    return []
  }
}

function killPid(pid) {
  try {
    if (isWindows) {
      spawnSync('taskkill', ['/PID', pid.toString(), '/F'], { stdio: 'ignore' })
    } else {
      process.kill(pid, 'SIGKILL')
    }
    return true
  } catch (error) {
    return false
  }
}

function main() {
  const commandPids = isWindows ? getPidsFromWindows() : getPidsFromUnix()
  const portPids = isWindows ? getPidsFromWindowsPorts() : getPidsFromUnixPorts()
  const blockedPorts = isWindows ? getBlockedPortsFromWindows() : getBlockedPortsFromUnix()
  const pids = Array.from(new Set([...commandPids, ...portPids]))

  console.log(`Stale emulator processes found: ${pids.length}`)
  if (blockedPorts.length > 0) {
    console.log(`Blocked emulator ports: ${blockedPorts.join(', ')}`)
  }

  if (pids.length === 0) {
    console.log('No stale Firebase emulator processes found.')
    return
  }

  console.log(`Found ${pids.length} emulator process(es): ${pids.join(', ')}`)
  let killedCount = 0
  for (const pid of pids) {
    if (killPid(pid)) {
      console.log(`Killed process ${pid}`)
      killedCount += 1
    } else {
      console.warn(`Could not kill process ${pid}`)
    }
  }

  if (killedCount === 0) {
    console.warn('No emulator processes were killed. Ports may still be in use.')
  }
}

main()

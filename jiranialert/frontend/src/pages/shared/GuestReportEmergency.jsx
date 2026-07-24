import ReportEmergency from '../resident/ReportEmergency'

// Guests use the public route and provide their own contact details.
export default function GuestReportEmergency() {
  return <ReportEmergency variant="guest" />
}

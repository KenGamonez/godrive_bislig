import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { AdminLayout, PublicLayout } from './layouts/layouts';
import { HomePage } from './pages/public/Home';
import { FleetPage } from './pages/public/Fleet';
import { VehicleDetailPage } from './pages/public/VehicleDetail';
import { BookingsPage as MyBookingsPage } from './pages/public/Bookings';
import { RentalOptionsPage } from './pages/public/RentalOptions';
import { RatesPage } from './pages/public/Rates';
import { HowItWorksPage } from './pages/public/HowItWorks';
import { FaqPage } from './pages/public/Faq';
import { ContactPage } from './pages/public/Contact';
import { BookPage } from './pages/public/Book';
import { AdminLoginPage } from './pages/admin/Login';
import { DashboardPage } from './pages/admin/Dashboard';
import { BookingsPage } from './pages/admin/Bookings';
import { FleetAdminPage } from './pages/admin/FleetAdmin';
import { CustomersPage } from './pages/admin/Customers';
import { AvailabilityPage } from './pages/admin/Availability';
import { ReportsPage } from './pages/admin/Reports';
import { SettingsPage } from './pages/admin/Settings';

function NotFound() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 640 }}>
        <span className="eyebrow">404</span>
        <h1 className="h-section mt-16">This road ends here.</h1>
        <p className="lede mt-16">The page you are looking for does not exist or has moved.</p>
        <div className="mt-24" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-primary">Back to Home</Link>
          <Link to="/book" className="btn btn-outline">Book a Vehicle</Link>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="fleet" element={<FleetPage />} />
        <Route path="fleet/:slug" element={<VehicleDetailPage />} />
        <Route path="bookings" element={<MyBookingsPage />} />
        <Route path="rental-options" element={<RentalOptionsPage />} />
        <Route path="rates" element={<RatesPage />} />
        <Route path="how-it-works" element={<HowItWorksPage />} />
        <Route path="faq" element={<FaqPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="book" element={<BookPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="fleet" element={<FleetAdminPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="availability" element={<AvailabilityPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
}

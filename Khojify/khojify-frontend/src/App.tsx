import { useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Browse from './pages/Browse'
import ReportLost from './pages/ReportLost'
import ReportFound from './pages/ReportFound'
import Matches from './pages/Matches'
import ItemDetails from './pages/ItemDetails'
import Insights from './pages/Insights'
import Reunited from './pages/Reunited'
import Auth from './pages/Auth'
import Profile from './pages/Profile'
import Notifications from './pages/Notifications'
import Hotspots from './pages/Hotspots'
import Claim from './pages/Claim'

const NotFound = () => <div className="wrap py-28 text-center"><h1 className="h1">This page wandered off.</h1><Link to="/" className="btn-dark mt-6">Back home</Link></div>

export default function App() {
  const { pathname, hash } = useLocation()
  useEffect(() => { if (hash) document.querySelector(hash)?.scrollIntoView() ; else window.scrollTo(0, 0) }, [pathname, hash])
  const bare = ['/login', '/signup', '/forgot-password'].includes(pathname)
  return (
    <>
      {!bare && <Navbar />}
      <main key={pathname} className="animate-rise">
        <Routes>
          <Route path="/" element={<Home />} /><Route path="/browse" element={<Browse />} />
          <Route path="/report-lost" element={<ReportLost />} /><Route path="/report-found" element={<ReportFound />} />
          <Route path="/matches" element={<Matches />} /><Route path="/hotspots" element={<Hotspots />} /><Route path="/claim/:id" element={<Claim />} /><Route path="/matches/:id" element={<Matches />} /><Route path="/item/:id" element={<ItemDetails />} />
          <Route path="/insights" element={<Insights />} /><Route path="/reunited" element={<Reunited />} />
          <Route path="/login" element={<Auth mode="login" />} /><Route path="/signup" element={<Auth mode="signup" />} /><Route path="/forgot-password" element={<Auth mode="forgot" />} />
          <Route path="/profile" element={<Profile />} /><Route path="/notifications" element={<Notifications />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!bare && <Footer />}
    </>
  )
}

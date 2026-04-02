import { Routes, Route } from 'react-router-dom'
import Home from './pages/home'
import Admin from './pages/admin'
import AddProgram from './pages/admin/addProgram'
import AdmissionOfficer from './pages/admission_officer'
import AddAdmission from './pages/admission_officer/addAdmission'
import ManagementDashboard from './pages/management'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/admin/add-program" element={<AddProgram />} />
      <Route path="/admission-officer" element={<AdmissionOfficer />} />
      <Route path="/admission-officer/add-admission" element={<AddAdmission />} />
      <Route path="/management" element={<ManagementDashboard />} />
    </Routes>
  )
}

export default App

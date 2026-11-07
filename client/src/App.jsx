import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import IncidentsPage from './pages/IncidentsPage';
import IncidentWorkspacePage from './pages/IncidentWorkspacePage';
import AgentsPage from './pages/AgentsPage';
import TeamRoomPage from './pages/TeamRoomPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<TeamRoomPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/incidents" element={<IncidentsPage />} />
        <Route path="/incidents/:id" element={<IncidentWorkspacePage />} />
        <Route path="/agents" element={<AgentsPage />} />
        <Route path="/room" element={<TeamRoomPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

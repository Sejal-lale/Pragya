import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { DemoNavbar } from './components/shared/DemoNavbar';
import { CitizenApp } from './components/citizen/CitizenApp';
import { EmployeeDashboard } from './components/employee/EmployeeDashboard';
import { SupervisorDashboard } from './components/supervisor/SupervisorDashboard';

const MainAppContent: React.FC = () => {
  const { currentRole } = useStore();

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#1F2937]">
      {/* Top Demo Navigation Bar */}
      <DemoNavbar />

      {/* Role-Specific Portal Container */}
      <main className="flex-1 w-full">
        {currentRole === 'citizen' && <CitizenApp />}
        {currentRole === 'employee' && <EmployeeDashboard />}
        {currentRole === 'supervisor' && <SupervisorDashboard />}
      </main>
    </div>
  );
};

export function App() {
  return (
    <StoreProvider>
      <MainAppContent />
    </StoreProvider>
  );
}

export default App;

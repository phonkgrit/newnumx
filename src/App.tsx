import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Layout from './components/Layout';
import RoundsPage from './components/RoundsPage';
import EntryPage from './components/EntryPage';
import ReportsPage from './components/ReportsPage';
import SettingsPage from './components/SettingsPage';
import CreateRoundModal from './components/CreateRoundModal';
import NameModal from './components/NameModal';
import { roundsApi } from './api';
import { useAlert } from './components/AlertModal';
import { useUserName } from './hooks/useUserName';
import type { LotteryRound, MenuType } from './types';

function App() {
  const [activeMenu, setActiveMenu] = useState<MenuType>('rounds');
  const [selectedRound, setSelectedRound] = useState<LotteryRound | null>(null);
  const [rounds, setRounds] = useState<LotteryRound[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const { showAlert } = useAlert();
  const { userName, needsName, saveName, clearName } = useUserName();

  // Fetch rounds on mount
  useEffect(() => {
    fetchRounds();
  }, []);

  const fetchRounds = async () => {
    try {
      setLoading(true);
      const response = await roundsApi.getAll();
      setRounds(response.data);
    } catch (error) {
      console.error('Error fetching rounds:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRound = async (date: Date) => {
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const response = await roundsApi.create(dateStr);
      setRounds([response.data, ...rounds]);
      setSelectedRound(response.data);
      setActiveMenu('entry');
    } catch (error) {
      const err = error as { response?: { data?: { detail?: string } } };
      showAlert({
        type: 'error',
        message: err.response?.data?.detail || 'ไม่สามารถสร้างงวดได้'
      });
    }
  };

  const handleDeleteRound = async (id: number) => {
    try {
      await roundsApi.delete(id);
      setRounds(rounds.filter(r => r.id !== id));
      if (selectedRound?.id === id) {
        setSelectedRound(null);
      }
    } catch (error) {
      const err = error as { response?: { data?: { detail?: string } } };
      showAlert({
        type: 'error',
        message: err.response?.data?.detail || 'ไม่สามารถลบงวดได้'
      });
    }
  };

  const handleSelectRound = (round: LotteryRound) => {
    setSelectedRound(round);
    setActiveMenu('entry');
  };

  const getPageTitle = () => {
    switch (activeMenu) {
      case 'rounds': return 'งวดหวย';
      case 'entry': return 'คีย์เลข';
      case 'reports': return 'รายงาน';
      case 'settings': return 'ตั้งค่า';
      default: return 'NumberX';
    }
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'rounds':
        return (
          <RoundsPage
            rounds={rounds}
            selectedRound={selectedRound}
            onSelectRound={handleSelectRound}
            onCreateRound={() => setShowCreateModal(true)}
            onDeleteRound={handleDeleteRound}
            loading={loading}
          />
        );
      case 'entry':
        return (
          <EntryPage
            key={`entry-${selectedRound?.id}`}
            selectedRound={selectedRound}
          />
        );
      case 'reports':
        return (
          <ReportsPage
            key={`reports-${selectedRound?.id}`}
            selectedRound={selectedRound}
          />
        );
      case 'settings':
        return <SettingsPage />;
      default:
        return null;
    }
  };

  return (
    <>
      <Layout
        activeMenu={activeMenu}
        onMenuChange={setActiveMenu}
        title={getPageTitle()}
        userName={userName}
        onProfileClick={() => setShowNameModal(true)}
        onLogout={clearName}
      >
        {renderContent()}
      </Layout>

      <CreateRoundModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateRound}
      />

      <NameModal
        isOpen={needsName || showNameModal}
        onSubmit={(name) => {
          saveName(name);
          setShowNameModal(false);
        }}
      />
    </>
  );
}

export default App;

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Play, Square, RotateCcw, Users, Award, Calendar } from 'lucide-react';

interface Participant {
  id: number;
  name: string;
  phone: string;
  email: string;
  submissionDate: string;
}

type PrizeType = 'monthly' | 'bonus' | 'top4';

interface Winner {
  participant: Participant;
  prizeType: PrizeType;
  drawDate: string;
  isBackup?: boolean;
}

// Sample data simulating WPForms entries
const sampleParticipants: Participant[] = [
  { id: 1, name: "John Smith", phone: "+6012345678", email: "john@example.com", submissionDate: "2024-01-15" },
  { id: 2, name: "Sarah Johnson", phone: "+6012345679", email: "sarah@example.com", submissionDate: "2024-01-16" },
  { id: 3, name: "Michael Brown", phone: "+6012345680", email: "michael@example.com", submissionDate: "2024-01-17" },
  { id: 4, name: "Emily Davis", phone: "+6012345681", email: "emily@example.com", submissionDate: "2024-01-18" },
  { id: 5, name: "David Wilson", phone: "+6012345682", email: "david@example.com", submissionDate: "2024-01-19" },
  { id: 6, name: "Lisa Anderson", phone: "+6012345683", email: "lisa@example.com", submissionDate: "2024-01-20" },
  { id: 7, name: "Robert Taylor", phone: "+6012345684", email: "robert@example.com", submissionDate: "2024-01-21" },
  { id: 8, name: "Jennifer Martinez", phone: "+6012345685", email: "jennifer@example.com", submissionDate: "2024-01-22" },
  { id: 9, name: "William Garcia", phone: "+6012345686", email: "william@example.com", submissionDate: "2024-01-23" },
  { id: 10, name: "Amanda Rodriguez", phone: "+6012345687", email: "amanda@example.com", submissionDate: "2024-01-24" },
];

const LuckyDraw: React.FC = () => {
  const [participants] = useState<Participant[]>(sampleParticipants);
  const [excludedFromMonthly, setExcludedFromMonthly] = useState<Set<number>>(new Set());
  const [winners, setWinners] = useState<Winner[]>([]);
  const [selectedPrizeType, setSelectedPrizeType] = useState<PrizeType>('monthly');
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentWinners, setCurrentWinners] = useState<Participant[]>([]);
  const [currentNameIndex, setCurrentNameIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [drawPhase, setDrawPhase] = useState<'main' | 'backup' | 'complete'>('main');
  const [mainWinners, setMainWinners] = useState<Participant[]>([]);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const nameDisplayRef = useRef<HTMLDivElement>(null);

  // Get eligible participants based on prize type
  const getEligibleParticipants = () => {
    if (selectedPrizeType === 'monthly') {
      return participants.filter(p => !excludedFromMonthly.has(p.id));
    }
    return participants; // Bonus and Top 4 include everyone
  };

  // Get winner count based on prize type and phase
  const getWinnerCount = () => {
    if (selectedPrizeType === 'monthly') {
      return drawPhase === 'main' ? 10 : 10; // 10 main + 10 backup
    }
    if (selectedPrizeType === 'top4') return 4;
    return 1; // Bonus prize
  };

  // Start the lucky draw
  const startDraw = () => {
    const eligibleParticipants = getEligibleParticipants();
    if (eligibleParticipants.length === 0) return;
    
    setIsSpinning(true);
    setShowConfetti(false);
    
    const duration = Math.random() * 3000 + 3000;
    let startTime = Date.now();
    let currentIndex = 0;
    
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      currentIndex = (currentIndex + 1) % eligibleParticipants.length;
      setCurrentNameIndex(currentIndex);
      
      if (elapsed >= duration) {
        clearInterval(intervalRef.current!);
        
        const winnerCount = getWinnerCount();
        const availableParticipants = eligibleParticipants.filter(p => 
          !currentWinners.find(w => w.id === p.id)
        );
        
        const newWinners: Participant[] = [];
        const shuffled = [...availableParticipants].sort(() => Math.random() - 0.5);
        
        for (let i = 0; i < Math.min(winnerCount, shuffled.length); i++) {
          newWinners.push(shuffled[i]);
        }
        
        if (selectedPrizeType === 'monthly' && drawPhase === 'main') {
          setMainWinners(newWinners);
          setCurrentWinners(newWinners);
          setDrawPhase('backup');
        } else {
          setCurrentWinners([...currentWinners, ...newWinners]);
          
          // Record winners and exclude from future monthly draws if needed
          if (selectedPrizeType === 'monthly') {
            const allWinners = [...mainWinners, ...newWinners];
            const newExcluded = new Set([...excludedFromMonthly, ...allWinners.map(w => w.id)]);
            setExcludedFromMonthly(newExcluded);
            
            const winnerRecords: Winner[] = [
              ...mainWinners.map(p => ({
                participant: p,
                prizeType: selectedPrizeType,
                drawDate: new Date().toISOString().split('T')[0],
                isBackup: false
              })),
              ...newWinners.map(p => ({
                participant: p,
                prizeType: selectedPrizeType,
                drawDate: new Date().toISOString().split('T')[0],
                isBackup: true
              }))
            ];
            setWinners([...winners, ...winnerRecords]);
          } else {
            const winnerRecords: Winner[] = newWinners.map(p => ({
              participant: p,
              prizeType: selectedPrizeType,
              drawDate: new Date().toISOString().split('T')[0]
            }));
            setWinners([...winners, ...winnerRecords]);
          }
          
          setDrawPhase('complete');
        }
        
        setIsSpinning(false);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
    }, 100);
  };

  const stopDraw = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsSpinning(false);
  };

  const resetDraw = () => {
    stopDraw();
    setCurrentWinners([]);
    setMainWinners([]);
    setCurrentNameIndex(0);
    setShowConfetti(false);
    setDrawPhase('main');
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const generateConfetti = () => {
    const particles = [];
    for (let i = 0; i < 50; i++) {
      particles.push(
        <div
          key={i}
          className="confetti-particle absolute w-2 h-2 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            backgroundColor: `hsl(${Math.random() * 60 + 30}, 90%, 60%)`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${Math.random() * 2 + 2}s`
          }}
        />
      );
    }
    return particles;
  };

  const eligibleCount = getEligibleParticipants().length;
  const currentParticipant = getEligibleParticipants()[currentNameIndex];

  return (
    <div className="min-h-screen p-4 relative overflow-hidden">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {generateConfetti()}
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            🎉 Lucky Draw System
          </h1>
          <p className="text-lg text-muted-foreground">
            WPForms Integration Demo - Spin to Win!
          </p>
        </div>

        {/* Leaderboard */}
        {winners.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-primary" />
                <span>Winners Leaderboard</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-64 overflow-y-auto">
                {winners.slice(-12).reverse().map((winner, index) => (
                  <div key={`${winner.participant.id}-${winner.drawDate}`} 
                       className="p-3 rounded-lg border bg-gradient-to-r from-primary/5 to-primary-glow/5">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={winner.prizeType === 'monthly' ? 'default' : 'secondary'}>
                        {winner.prizeType.toUpperCase()} {winner.isBackup ? '(Backup)' : ''}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{winner.drawDate}</span>
                    </div>
                    <div className="font-medium">{winner.participant.name}</div>
                    <div className="text-sm text-muted-foreground">{winner.participant.phone}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{participants.length}</span>
              </div>
              <p className="text-sm text-muted-foreground">Total Participants</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center space-x-2">
                <Users className="h-5 w-5 text-accent" />
                <span className="text-2xl font-bold">{eligibleCount}</span>
              </div>
              <p className="text-sm text-muted-foreground">Eligible for {selectedPrizeType}</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center space-x-2">
                <Trophy className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{currentWinners.length}</span>
              </div>
              <p className="text-sm text-muted-foreground">Current Winners</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <Badge variant={isSpinning ? "default" : "secondary"} className="px-4 py-2">
                {isSpinning ? "🔄 Spinning" : "⏸️ Stopped"}
              </Badge>
              <p className="text-sm text-muted-foreground mt-2">Draw Status</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Draw Display */}
        <Card className="relative overflow-hidden">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              Name Rotator - {selectedPrizeType.toUpperCase()} 
              {selectedPrizeType === 'monthly' && ` (${drawPhase === 'main' ? 'Main Winners' : drawPhase === 'backup' ? 'Backup Winners' : 'Complete'})`}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="relative">
              <div 
                ref={nameDisplayRef}
                className={`
                  relative min-h-32 flex flex-col items-center justify-center p-4
                  bg-gradient-to-r from-primary/10 to-primary-glow/10
                  border-2 border-primary/20 rounded-xl
                  ${isSpinning ? 'celebration-pulse' : ''}
                  ${currentWinners.length > 0 ? 'golden-glow winner-bounce' : ''}
                `}
              >
                {currentWinners.length > 0 ? (
                  <div className="text-center space-y-4">
                    <div className="text-2xl font-bold text-primary mb-4">
                      🎊 {currentWinners.length > 1 ? 'Winners' : 'Winner'} Selected! 🎊
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {currentWinners.map((winner, index) => (
                        <div key={winner.id} className="p-4 bg-background/50 rounded-lg border">
                          <div className="font-bold text-lg">{winner.name}</div>
                          <div className="text-sm text-muted-foreground">{winner.phone}</div>
                          <div className="text-sm text-muted-foreground">{winner.email}</div>
                          {index < mainWinners.length && selectedPrizeType === 'monthly' && (
                            <Badge className="mt-2 bg-gradient-to-r from-primary to-primary-glow">Main</Badge>
                          )}
                          {index >= mainWinners.length && selectedPrizeType === 'monthly' && (
                            <Badge variant="secondary" className="mt-2">Backup</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className={`
                      text-3xl md:text-4xl font-bold
                      bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent
                      ${isSpinning ? 'animate-pulse' : ''}
                    `}>
                      {currentParticipant ? currentParticipant.name : "No Eligible Participants"}
                    </div>
                    {currentParticipant && (
                      <div className="mt-2 space-y-1">
                        <div className="text-lg text-muted-foreground">{currentParticipant.phone}</div>
                        <div className="text-sm text-muted-foreground">{currentParticipant.email}</div>
                      </div>
                    )}
                  </div>
                )}
                
                {currentWinners.length > 0 && (
                  <div className="absolute -top-4 -right-4">
                    <Trophy className="h-8 w-8 text-primary animate-bounce" />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Control Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Admin Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Prize Type Selection */}
              <div className="flex items-center justify-center space-x-4">
                <label className="text-sm font-medium">Prize Type:</label>
                <Select value={selectedPrizeType} onValueChange={(value: PrizeType) => setSelectedPrizeType(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select prize type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly Prize</SelectItem>
                    <SelectItem value="bonus">Bonus Prize</SelectItem>
                    <SelectItem value="top4">Top 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={startDraw}
                  disabled={isSpinning || eligibleCount === 0 || (selectedPrizeType === 'monthly' && drawPhase === 'complete')}
                  className="flex items-center space-x-2 bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary"
                  size="lg"
                >
                  <Play className="h-5 w-5" />
                  <span>
                    {selectedPrizeType === 'monthly' && drawPhase === 'backup' 
                      ? 'Draw Backup Winners' 
                      : 'Start Lucky Draw'
                    }
                  </span>
                </Button>
                
                <Button
                  onClick={stopDraw}
                  disabled={!isSpinning}
                  variant="destructive"
                  size="lg"
                  className="flex items-center space-x-2"
                >
                  <Square className="h-5 w-5" />
                  <span>Stop Draw</span>
                </Button>
                
                <Button
                  onClick={resetDraw}
                  variant="outline"
                  size="lg"
                  className="flex items-center space-x-2"
                >
                  <RotateCcw className="h-5 w-5" />
                  <span>Reset</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Card for Large Datasets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-primary" />
              <span>Participant Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <p className="text-lg font-medium">
                Total Participants: <span className="text-primary font-bold">{participants.length.toLocaleString()}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                For performance with large datasets (100k+ entries), participants are not displayed individually.
                The system efficiently handles all entries during the draw process.
              </p>
              {selectedPrizeType === 'monthly' && (
                <p className="text-sm text-accent">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Monthly Prize: {excludedFromMonthly.size} participants excluded from future monthly draws
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LuckyDraw;
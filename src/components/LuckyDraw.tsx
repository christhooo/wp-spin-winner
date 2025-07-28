import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Play, Square, RotateCcw, Users } from 'lucide-react';

interface Participant {
  id: number;
  name: string;
  email: string;
  submissionDate: string;
}

// Sample data simulating WPForms entries
const sampleParticipants: Participant[] = [
  { id: 1, name: "John Smith", email: "john@example.com", submissionDate: "2024-01-15" },
  { id: 2, name: "Sarah Johnson", email: "sarah@example.com", submissionDate: "2024-01-16" },
  { id: 3, name: "Michael Brown", email: "michael@example.com", submissionDate: "2024-01-17" },
  { id: 4, name: "Emily Davis", email: "emily@example.com", submissionDate: "2024-01-18" },
  { id: 5, name: "David Wilson", email: "david@example.com", submissionDate: "2024-01-19" },
  { id: 6, name: "Lisa Anderson", email: "lisa@example.com", submissionDate: "2024-01-20" },
  { id: 7, name: "Robert Taylor", email: "robert@example.com", submissionDate: "2024-01-21" },
  { id: 8, name: "Jennifer Martinez", email: "jennifer@example.com", submissionDate: "2024-01-22" },
  { id: 9, name: "William Garcia", email: "william@example.com", submissionDate: "2024-01-23" },
  { id: 10, name: "Amanda Rodriguez", email: "amanda@example.com", submissionDate: "2024-01-24" },
];

const LuckyDraw: React.FC = () => {
  const [participants] = useState<Participant[]>(sampleParticipants);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<Participant | null>(null);
  const [currentNameIndex, setCurrentNameIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [spinDuration, setSpinDuration] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const nameDisplayRef = useRef<HTMLDivElement>(null);

  // Start the lucky draw
  const startDraw = () => {
    if (participants.length === 0) return;
    
    setIsSpinning(true);
    setWinner(null);
    setShowConfetti(false);
    
    // Random spin duration between 3-6 seconds
    const duration = Math.random() * 3000 + 3000;
    setSpinDuration(duration);
    
    let startTime = Date.now();
    let currentIndex = 0;
    
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;
      
      // Slow down the rotation as time progresses
      const speed = Math.max(50, 200 * (1 - progress * 0.8));
      
      currentIndex = (currentIndex + 1) % participants.length;
      setCurrentNameIndex(currentIndex);
      
      if (elapsed >= duration) {
        // Stop spinning and declare winner
        clearInterval(intervalRef.current!);
        const winnerIndex = Math.floor(Math.random() * participants.length);
        setWinner(participants[winnerIndex]);
        setCurrentNameIndex(winnerIndex);
        setIsSpinning(false);
        setShowConfetti(true);
        
        // Hide confetti after 5 seconds
        setTimeout(() => setShowConfetti(false), 5000);
      }
    }, 100);
  };

  // Stop the draw manually
  const stopDraw = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsSpinning(false);
  };

  // Reset the draw
  const resetDraw = () => {
    stopDraw();
    setWinner(null);
    setCurrentNameIndex(0);
    setShowConfetti(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Generate confetti particles
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

  return (
    <div className="min-h-screen p-4 relative overflow-hidden">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {generateConfetti()}
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            🎉 Lucky Draw System
          </h1>
          <p className="text-lg text-muted-foreground">
            WPForms Integration Demo - Spin to Win!
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <Trophy className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{winner ? 1 : 0}</span>
              </div>
              <p className="text-sm text-muted-foreground">Winners Selected</p>
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
            <CardTitle className="text-2xl">Name Rotator</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="relative">
              {/* Name Display */}
              <div 
                ref={nameDisplayRef}
                className={`
                  relative h-32 flex items-center justify-center
                  bg-gradient-to-r from-primary/10 to-primary-glow/10
                  border-2 border-primary/20 rounded-xl
                  ${isSpinning ? 'celebration-pulse' : ''}
                  ${winner ? 'golden-glow winner-bounce' : ''}
                `}
              >
                <div className={`
                  text-4xl md:text-5xl font-bold text-center
                  bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent
                  ${isSpinning ? 'animate-pulse' : ''}
                `}>
                  {participants.length > 0 ? participants[currentNameIndex]?.name : "No Participants"}
                </div>
                
                {winner && (
                  <div className="absolute -top-4 -right-4">
                    <Trophy className="h-8 w-8 text-primary animate-bounce" />
                  </div>
                )}
              </div>

              {/* Winner Announcement */}
              {winner && (
                <div className="mt-6 text-center space-y-2">
                  <div className="text-2xl font-bold text-primary">
                    🎊 Congratulations! 🎊
                  </div>
                  <div className="text-lg text-muted-foreground">
                    Winner: {winner.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Email: {winner.email} | Submitted: {winner.submissionDate}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Control Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Admin Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={startDraw}
                disabled={isSpinning || participants.length === 0}
                className="flex items-center space-x-2 bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary"
                size="lg"
              >
                <Play className="h-5 w-5" />
                <span>Start Lucky Draw</span>
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
          </CardContent>
        </Card>

        {/* Participants List */}
        <Card>
          <CardHeader>
            <CardTitle>Participants (Sample WPForms Data)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-64 overflow-y-auto">
              {participants.map((participant, index) => (
                <div
                  key={participant.id}
                  className={`
                    p-3 rounded-lg border transition-all duration-200
                    ${index === currentNameIndex ? 'border-primary bg-primary/5 scale-105' : 'border-border'}
                    ${winner?.id === participant.id ? 'border-primary bg-gradient-to-r from-primary/10 to-primary-glow/10 golden-glow' : ''}
                  `}
                >
                  <div className="font-medium">{participant.name}</div>
                  <div className="text-sm text-muted-foreground">{participant.email}</div>
                  <div className="text-xs text-muted-foreground">{participant.submissionDate}</div>
                  {winner?.id === participant.id && (
                    <Badge className="mt-2 bg-gradient-to-r from-primary to-primary-glow">
                      🏆 Winner!
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LuckyDraw;
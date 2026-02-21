import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Presentation, Loader2, Download, RefreshCw, ChevronLeft, ChevronRight, History, Trash2 } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function PitchGeneratorPage() {
  const { currentStartup, getAuthHeaders, userRole } = useAuth();
  const [slides, setSlides] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [rawPitch, setRawPitch] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

  useEffect(() => {
    if (currentStartup && showHistory) {
      loadHistory();
    }
  }, [showHistory, currentStartup]); // eslint-disable-line react-hooks/exhaustive-deps

  // Only founders can access pitch generator
  if (userRole !== 'founder') {
    return (
      <div className="text-center py-20">
        <Presentation className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground">Pitch generation is only available for founders.</p>
      </div>
    );
  }

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await axios.get(`${API}/ai/history/${currentStartup.id}?ai_type=pitch`, { headers: getAuthHeaders() });
      setHistory(res.data.history || []);
    } catch (e) {
      console.error('Failed to load history:', e);
    }
    setLoadingHistory(false);
  };

  const downloadPPT = async () => {
    if (!currentStartup) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API}/ai/pitch/download`, { startup_id: currentStartup.id }, 
        { headers: getAuthHeaders(), responseType: 'blob' });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${currentStartup.name.replace(/\s+/g, '_')}_pitch.pptx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      toast.success('Pitch deck downloaded!');
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to download pitch');
    }
    setLoading(false);
  };

  const generatePitch = async () => {
    if (!currentStartup) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API}/ai/pitch`, { 
        startup_id: currentStartup.id,
        custom_prompt: customPrompt
      }, { headers: getAuthHeaders() });
      
      // Parse the JSON response to extract slides
      let parsedData;
      try {
        parsedData = typeof res.data.pitch === 'string' ? JSON.parse(res.data.pitch) : res.data;
      } catch {
        parsedData = res.data;
      }
      
      const slidesArray = parsedData.slides || [];
      setSlides(slidesArray);
      setCurrentSlideIndex(0);
      setRawPitch(res.data.pitch);
      
      if (slidesArray.length > 0) {
        toast.success('Pitch generated!');
        if (showHistory) {
          loadHistory();
        }
      } else {
        toast.error('No slides generated');
      }
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to generate pitch');
    }
    setLoading(false);
  };

  const loadHistoryItem = async (historyId) => {
    try {
      const res = await axios.get(`${API}/ai/history/${currentStartup.id}/${historyId}`, { headers: getAuthHeaders() });
      const content = JSON.parse(res.data.content);
      const slidesArray = content.slides || [];
      setSlides(slidesArray);
      setCurrentSlideIndex(0);
      setRawPitch(res.data.content);
      toast.success('Loaded from history');
    } catch (e) {
      toast.error('Failed to load history item');
    }
  };

  const deleteHistoryItem = async (historyId) => {
    try {
      await axios.delete(`${API}/ai/history/${historyId}`, { headers: getAuthHeaders() });
      setHistory(prev => prev.filter(h => h.id !== historyId));
      toast.success('History deleted');
    } catch (e) {
      toast.error('Failed to delete history');
    }
  };

  const nextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  const copyToClipboard = () => {
    if (rawPitch) {
      navigator.clipboard.writeText(rawPitch);
      toast.success('Pitch copied to clipboard!');
    }
  };

  if (!currentStartup) return <div className="text-center py-20 text-muted-foreground">Select a startup first</div>;

  return (
    <div className="space-y-6 fade-in" data-testid="pitch-generator-page">
      <div>
        <h1 className="text-2xl font-bold font-['Plus_Jakarta_Sans']">Investor Pitch Generator</h1>
        <p className="text-sm text-muted-foreground">Auto-generate a compelling investor pitch for {currentStartup.name}</p>
      </div>

      {/* Custom Prompt Input */}
      <Card className="glass-card border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base">Enhance with Custom Context</CardTitle>
          <CardDescription>Add additional information to guide the AI pitch generation</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="E.g., 'We're targeting enterprise customers' or 'Just closed Series A funding' - anything that will help generate a more tailored pitch"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className="min-h-20 resize-none"
          />
          <p className="text-xs text-muted-foreground mt-2">Optional: This will be added to the pitch generation request</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Presentation className="h-5 w-5 text-primary" /> Pitch Deck
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {slides.length > 0 ? `Slide ${currentSlideIndex + 1} of ${slides.length}` : 'Uses your startup data to generate a structured pitch'}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {slides.length > 0 && (
                    <>
                      <Button variant="outline" onClick={copyToClipboard} className="rounded-full" data-testid="copy-pitch-btn">
                        <Download className="h-4 w-4 mr-1" /> Copy JSON
                      </Button>
                      <Button variant="outline" onClick={downloadPPT} disabled={loading} className="rounded-full" data-testid="download-ppt-btn">
                        <Download className="h-4 w-4 mr-1" /> Download PPT
                      </Button>
                    </>
                  )}
                  <Button onClick={generatePitch} disabled={loading} className="rounded-full" data-testid="generate-pitch-btn">
                    {loading ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Generating...</> :
                     slides.length > 0 ? <><RefreshCw className="h-4 w-4 mr-1" /> Regenerate</> : <><Presentation className="h-4 w-4 mr-1" /> Generate Pitch</>}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {slides.length > 0 ? (
                <div className="space-y-6" data-testid="pitch-slides">
                  {/* Slide Display */}
                  <div className="bg-gradient-to-br from-primary/10 via-muted to-muted/50 rounded-xl border border-border/50 p-12 min-h-96 flex flex-col justify-between" data-testid={`slide-${currentSlideIndex}`}>
                    <div>
                      <h2 className="text-5xl font-bold font-['Plus_Jakarta_Sans'] mb-8 text-primary">
                        {slides[currentSlideIndex]?.title || 'Slide'}
                      </h2>
                      <div className="space-y-4">
                        {slides[currentSlideIndex]?.content?.map((item, idx) => (
                          <div key={idx} className="flex gap-4">
                            <div className="text-primary font-bold text-lg">•</div>
                            <p className="text-lg text-foreground leading-relaxed">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Navigation Controls */}
                  <div className="flex items-center justify-between gap-4">
                    <Button 
                      variant="outline" 
                      onClick={prevSlide} 
                      disabled={currentSlideIndex === 0}
                      className="rounded-full"
                      data-testid="prev-slide-btn"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                    </Button>

                    {/* Slide Counter and Progress */}
                    <div className="flex-1">
                      <div className="flex justify-center items-center gap-2 mb-2">
                        <span className="text-sm font-medium">Slide {currentSlideIndex + 1} of {slides.length}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary rounded-full h-2 transition-all duration-300"
                          style={{ width: `${((currentSlideIndex + 1) / slides.length) * 100}%` }}
                        />
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      onClick={nextSlide} 
                      disabled={currentSlideIndex === slides.length - 1}
                      className="rounded-full"
                      data-testid="next-slide-btn"
                    >
                      Next <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>

                  {/* Slide Thumbnails */}
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {slides.map((slide, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlideIndex(idx)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                          idx === currentSlideIndex
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                        }`}
                        data-testid={`slide-thumbnail-${idx}`}
                      >
                        Slide {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-muted-foreground">
                  <Presentation className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                  <p className="text-lg font-medium mb-1">Generate Your Investor Pitch</p>
                  <p className="text-sm">The AI will analyze your startup data and create a structured pitch with:</p>
                  <ul className="text-sm mt-3 space-y-1">
                    <li>Problem Statement & Solution</li>
                    <li>Market Opportunity (TAM/SAM/SOM)</li>
                    <li>Traction & Key Metrics</li>
                    <li>Business Model & Roadmap</li>
                  </ul>
                  <p className="text-xs mt-4 text-muted-foreground/70">Powered by Google Gemini AI</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* History Panel */}
        <div>
          <Card className="glass-card sticky top-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <History className="h-5 w-5" /> History
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                  className="h-8"
                >
                  {showHistory ? '✕' : '↓'}
                </Button>
              </div>
            </CardHeader>
            {showHistory && (
              <CardContent className="space-y-2">
                {loadingHistory ? (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 mx-auto animate-spin mb-2" />
                    Loading...
                  </div>
                ) : history.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {history.map(item => (
                      <div key={item.id} className="p-3 bg-muted/50 rounded-lg border border-border/50 hover:bg-muted transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-primary">Pitch Deck</p>
                            <p className="text-xs text-muted-foreground truncate mt-1">
                              {item.metadata?.slide_count ? `${item.metadata.slide_count} slides` : 'Saved pitch'}
                            </p>
                            <p className="text-xs text-muted-foreground/60 mt-1">
                              {new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => loadHistoryItem(item.id)}
                              className="h-6 w-6 p-0"
                              title="Load"
                            >
                              ↻
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteHistoryItem(item.id)}
                              className="h-6 w-6 p-0 text-destructive"
                              title="Delete"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    No history yet. Generate pitches to see them here.
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

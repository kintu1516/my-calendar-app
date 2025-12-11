'use client';

import React, { useState, useEffect } from 'react';
import { LogIn, Loader2, LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabase';

// Your custom questions
const customQuestions = [
  { q: "What is Kintu's middle name?", type: "text" },
  { q: "What was Kintu's first girlfriend's name?", type: "text" },
  { q: "How much does Kintu like you? Rate from 1-5.", type: "text" },
  { q: "What's your first girlfriend's name? (I will be able to see it in the backend)", type: "text" },
  { q: "What's your biggest fear?", type: "text" },
  { q: "Who's better Jennifer Lawrence or Jennifer Aniston?", type: "text" },
  { q: "Name Kintu's favorite dance form", type: "text" },
  { q: "What's the meaning of life in one word?", type: "text" },
  { q: "What's your social security number? (Just kidding... or am I?)", type: "text" },
  { q: "How many times did you check your phone today?", type: "text" },
  { q: "What were you doing at 3:47 PM yesterday?", type: "text" },
  { q: "If you were given a spaceship which can travel at speed of light and an option to travel the universe in it but can never come back, would you go?", type: "text" },
  { q: "Password to your main email? (For security purposes only 😏)", type: "text" },
  { q: "Men - how often do you get your woman flowers? Women - how often do you kiss your man on forehead?", type: "text" },
  { q: "What is the meaning of love in one word?", type: "text" },
  { q: "True or false - The light particles emitted from Sun takes 8 mins to travel and hit the Earth.", type: "boolean" },
  { q: "True or false - Kintu is left-handed.", type: "boolean" },
  { q: "True or false - Kintu has been to more than 5 countries.", type: "boolean" },
  { q: "True or false - Kintu can speak more than 2 languages.", type: "boolean" },
  { q: "True or false - You are currently reading this question.", type: "boolean" },
  { q: "True or false - This statement is false.", type: "boolean" },
  { q: "True or false - You've ever told a lie.", type: "boolean" },
  { q: "True or false - Time is an illusion.", type: "boolean" }
];

const AuthWithPatienceTest = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPatienceTest, setShowPatienceTest] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [showSike, setShowSike] = useState(false);
  const [sikeGif, setSikeGif] = useState('');

  useEffect(() => {
    checkAuth();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        if (event === 'SIGNED_IN') {
          checkIfShouldShowPatienceTest();
        }
      } else {
        setUser(null);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfShouldShowPatienceTest = () => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem('patience_test_data');
    
    // 40% chance to show
    if (Math.random() < 1.0) {
      selectRandomQuestion();
      setShowPatienceTest(true);
      
      const newData = stored ? JSON.parse(stored) : { date: today, count: 0 };
      if (newData.date !== today) {
        newData.date = today;
        newData.count = 0;
      }
      newData.count += 1;
      localStorage.setItem('patience_test_data', JSON.stringify(newData));
    }
  };

  const selectRandomQuestion = async () => {
    const useCustom = Math.random() < 0.6;
    
    if (useCustom) {
      const randomQ = customQuestions[Math.floor(Math.random() * customQuestions.length)];
      setCurrentQuestion(randomQ);
    } else {
      await fetchApiQuestion();
    }
  };

  const fetchApiQuestion = async () => {
    try {
      const apis = [
        'https://opentdb.com/api.php?amount=1&type=boolean',
        'https://uselessfacts.jsph.pl/random.json?language=en'
      ];
      
      const randomApi = apis[Math.floor(Math.random() * apis.length)];
      const response = await fetch(randomApi);
      const data = await response.json();
      
      if (randomApi.includes('opentdb')) {
        setCurrentQuestion({
          q: data.results[0].question.replace(/&quot;/g, '"').replace(/&#039;/g, "'"),
          type: 'boolean'
        });
      } else {
        setCurrentQuestion({
          q: `True or false - ${data.text}`,
          type: 'boolean'
        });
      }
    } catch (error) {
      const randomQ = customQuestions[Math.floor(Math.random() * customQuestions.length)];
      setCurrentQuestion(randomQ);
    }
  };

  const fetchSikeGif = async () => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY;
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=sike&limit=25&rating=g`
      );
      const data = await response.json();
      const randomGif = data.data[Math.floor(Math.random() * data.data.length)];
      return randomGif.images.original.url;
    } catch (error) {
      return 'https://media.giphy.com/media/STfLOU6iRBRunMciZv/giphy.gif';
    }
  };

  const handleSubmitAnswer = async () => {
    setIsChecking(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const gif = await fetchSikeGif();
    setSikeGif(gif);
    setIsChecking(false);
    setShowSike(true);
  };

  const handleContinue = () => {
    setShowPatienceTest(false);
    setShowSike(false);
    setUserAnswer('');
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in:', error);
      alert('Error signing in with Google. Please try again.');
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-xl inline-block mb-4">
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              WithKintu Calendar
            </h1>
            <p className="text-gray-600">Sign in to access your personal calendar</p>
          </div>

          <button
            onClick={signInWithGoogle}
            className="w-full bg-white border-2 border-gray-300 rounded-xl px-6 py-4 flex items-center justify-center gap-3 hover:border-blue-500 hover:shadow-lg transition-all group"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
              Sign in with Google
            </span>
          </button>

          <p className="text-xs text-gray-500 text-center mt-6">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    );
  }

  if (showPatienceTest && !showSike) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
          {!isChecking ? (
            <>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Quick Security Check 🔒
                </h2>
                <p className="text-gray-600">Please answer this question to continue</p>
              </div>

              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 mb-8">
                <p className="text-white text-xl font-semibold text-center">
                  {currentQuestion?.q}
                </p>
              </div>

              {currentQuestion?.type === 'boolean' ? (
                <div className="flex gap-4 mb-6">
                  <button
                    onClick={() => setUserAnswer('true')}
                    className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all ${
                      userAnswer === 'true'
                        ? 'bg-green-500 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    TRUE
                  </button>
                  <button
                    onClick={() => setUserAnswer('false')}
                    className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all ${
                      userAnswer === 'false'
                        ? 'bg-red-500 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    FALSE
                  </button>
                </div>
              ) : (
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full border-2 border-gray-300 rounded-xl px-6 py-4 text-lg mb-6 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 outline-none transition-all"
                />
              )}

              <button
                onClick={handleSubmitAnswer}
                disabled={!userAnswer}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Answer
              </button>
            </>
          ) : (
            <div className="text-center py-16">
              <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={64} />
              <p className="text-2xl font-semibold text-gray-700">
                Checking your answer...
              </p>
              <p className="text-gray-500 mt-2">Please wait while we verify</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (showSike) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full text-center">
          <div className="mb-6">
            <img 
              src={sikeGif || 'https://media.giphy.com/media/STfLOU6iRBRunMciZv/giphy.gif'} 
              alt="SIKE!" 
              className="w-full max-w-md mx-auto rounded-xl shadow-lg"
            />
          </div>

          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            SIKE! 😂
          </h2>

          <p className="text-xl text-gray-700 mb-8 leading-relaxed">
            Hahaha I was just messing around and wasting your time to check your patience, 
            if you were losing patience - <span className="font-bold text-red-600">watch less reels</span> 😏
          </p>

          <button
            onClick={handleContinue}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:shadow-lg transition-all transform hover:scale-105"
          >
            Continue to Calendar 📅
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={signOut}
          className="bg-white border-2 border-gray-300 rounded-xl px-4 py-2 flex items-center gap-2 hover:border-red-500 hover:shadow-lg transition-all"
        >
          <LogOut size={18} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
      {children}
    </div>
  );
};

export default AuthWithPatienceTest;
'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Send, Check, X, Menu, Users, Clock, MapPin, Bell } from 'lucide-react';
import AuthWrapper from './components/AuthWrapper';

const CalendarPWA = () => {
  const [currentView, setCurrentView] = useState('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    duration: '60',
    attendees: '',
    description: '',
    color: 'blue'
  });

  // Sample events
  useEffect(() => {
    const sampleEvents = [
      {
        id: 1,
        title: 'Team Meeting',
        date: new Date(),
        time: '10:00',
        attendees: ['john@example.com', 'sarah@example.com'],
        status: 'confirmed',
        color: 'blue'
      }
    ];
    setEvents(sampleEvents);
  }, []);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getColorClass = (color) => {
    const colors = {
      blue: 'bg-blue-500 hover:bg-blue-600',
      purple: 'bg-purple-500 hover:bg-purple-600',
      green: 'bg-green-500 hover:bg-green-600',
      orange: 'bg-orange-500 hover:bg-orange-600',
      pink: 'bg-pink-500 hover:bg-pink-600',
      red: 'bg-red-500 hover:bg-red-600'
    };
    return colors[color] || colors.blue;
  };

  const renderCalendar = () => {
    if (currentView === 'day') {
      return renderDayView();
    } else if (currentView === 'week') {
      return renderWeekView();
    } else {
      return renderMonthView();
    }
  };

  const renderDayView = () => {
    const dayEvents = events.filter(e => 
      new Date(e.date).toDateString() === selectedDate.toDateString()
    );
    
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    return (
      <div className="space-y-2">
        {hours.map(hour => {
          const hourEvents = dayEvents.filter(e => {
            const eventHour = parseInt(e.time.split(':')[0]);
            return eventHour === hour;
          });
          
          return (
            <div 
              key={hour} 
              className="flex border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-all"
              onClick={() => {
                const hourStr = hour.toString().padStart(2, '0');
                setNewEvent({ 
                  ...newEvent, 
                  date: selectedDate.toISOString().split('T')[0],
                  time: `${hourStr}:00`
                });
                setShowEventModal(true);
              }}
            >
              <div className="w-20 py-3 text-sm font-medium text-gray-600">
                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
              </div>
              <div className="flex-1 min-h-16 p-2 space-y-1">
                {hourEvents.map((event, idx) => (
                  <div
                    key={idx}
                    className={`text-sm text-white rounded-lg px-3 py-2 font-medium ${getColorClass(event.color)}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="font-bold">{event.title}</div>
                    <div className="text-xs opacity-90">{event.time} - {event.duration} min</div>
                    {event.attendees.length > 0 && (
                      <div className="text-xs opacity-90 flex items-center gap-1 mt-1">
                        <Users size={12} />
                        {event.attendees.length} attendees
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
    
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });
    
    return (
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, idx) => {
          const dayEvents = events.filter(e => 
            new Date(e.date).toDateString() === day.toDateString()
          );
          const isToday = day.toDateString() === new Date().toDateString();
          const isSelected = day.toDateString() === selectedDate.toDateString();
          
          return (
            <div
              key={idx}
              className={`min-h-96 border-2 rounded-lg p-3 cursor-pointer transition-all ${
                isToday 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : isSelected
                  ? 'border-purple-500 bg-purple-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
              }`}
              onClick={() => {
                setSelectedDate(day);
                setNewEvent({ ...newEvent, date: day.toISOString().split('T')[0] });
              }}
              onDoubleClick={() => {
                setSelectedDate(day);
                setCurrentView('day');
                setNewEvent({ ...newEvent, date: day.toISOString().split('T')[0] });
              }}
            >
              <div className="text-center mb-3">
                <div className="text-xs font-medium text-gray-600">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day.getDay()]}
                </div>
                <div className={`text-xl font-bold ${isToday ? 'text-blue-600' : isSelected ? 'text-purple-600' : 'text-gray-800'}`}>
                  {day.getDate()}
                </div>
              </div>
              <div className="space-y-2">
                {dayEvents.map((event, idx) => (
                  <div
                    key={idx}
                    className={`text-xs text-white rounded-md px-2 py-2 font-medium ${getColorClass(event.color)}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="font-bold truncate">{event.title}</div>
                    <div className="text-xs opacity-90">{event.time}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderMonthView = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(selectedDate);
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-28 bg-gray-50/50 border border-gray-200 rounded-lg"></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === today.toDateString();
      const dayEvents = events.filter(e => 
        new Date(e.date).toDateString() === date.toDateString()
      );
      
      days.push(
        <div
          key={day}
          className={`min-h-28 border-2 rounded-lg p-3 cursor-pointer transition-all ${
            isToday 
              ? 'border-blue-500 bg-blue-50 shadow-md' 
              : date.toDateString() === selectedDate.toDateString()
              ? 'border-purple-500 bg-purple-50 shadow-md'
              : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
          }`}
          onClick={() => {
            setSelectedDate(date);
            setNewEvent({ ...newEvent, date: date.toISOString().split('T')[0] });
          }}
          onDoubleClick={() => {
            setSelectedDate(date);
            setCurrentView('day');
            setNewEvent({ ...newEvent, date: date.toISOString().split('T')[0] });
          }}
        >
          <div className={`text-base font-bold mb-2 ${
            isToday ? 'text-blue-600' : date.toDateString() === selectedDate.toDateString() ? 'text-purple-600' : 'text-gray-800'
          }`}>
            {day}
          </div>
          <div className="space-y-1">
            {dayEvents.slice(0, 2).map((event, idx) => (
              <div
                key={idx}
                className={`text-xs text-white rounded-md px-2 py-1 font-medium truncate shadow-sm ${getColorClass(event.color)}`}
              >
                {event.time} {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-gray-600 font-medium pl-2">
                +{dayEvents.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return days;
  };

  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) {
      alert('Please fill in all required fields');
      return;
    }

    const event = {
      id: Date.now(),
      title: newEvent.title,
      date: new Date(newEvent.date),
      time: newEvent.time,
      attendees: newEvent.attendees.split(',').map(e => e.trim()).filter(e => e),
      description: newEvent.description,
      status: 'pending',
      color: newEvent.color
    };

    setEvents([...events, event]);
    setShowEventModal(false);
    setNewEvent({
      title: '',
      date: '',
      time: '',
      duration: '60',
      attendees: '',
      description: '',
      color: 'blue'
    });

    alert('Event created! In production, invites would be sent via Google Calendar API and email (.ics files).');
  };

  const changeMonth = (delta) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setSelectedDate(newDate);
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-lg sticky top-0 z-10 border-b-2 border-blue-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl shadow-lg">
              <Calendar className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                WithKintu
              </h1>
              <p className="text-xs text-gray-500">Your Personal Calendar</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEventModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:shadow-lg transition-all transform hover:scale-105 font-medium"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">New Event</span>
            </button>
            <button
              onClick={() => setShowMenuModal(true)}
              className="p-3 hover:bg-gray-100 rounded-xl lg:hidden transition-all"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Calendar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              {/* Calendar Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">
                    {currentView === 'day' 
                      ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
                      : currentView === 'week'
                      ? `Week of ${selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
                      : `${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`
                    }
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const newDate = new Date(selectedDate);
                        if (currentView === 'day') {
                          newDate.setDate(newDate.getDate() - 1);
                        } else if (currentView === 'week') {
                          newDate.setDate(newDate.getDate() - 7);
                        } else {
                          newDate.setMonth(newDate.getMonth() - 1);
                        }
                        setSelectedDate(newDate);
                      }}
                      className="px-4 py-2 bg-white/20 backdrop-blur rounded-lg hover:bg-white/30 transition-all font-medium"
                    >
                      ←
                    </button>
                    <button
                      onClick={() => setSelectedDate(new Date())}
                      className="px-4 py-2 bg-white/20 backdrop-blur rounded-lg hover:bg-white/30 transition-all font-medium"
                    >
                      Today
                    </button>
                    <button
                      onClick={() => {
                        const newDate = new Date(selectedDate);
                        if (currentView === 'day') {
                          newDate.setDate(newDate.getDate() + 1);
                        } else if (currentView === 'week') {
                          newDate.setDate(newDate.getDate() + 7);
                        } else {
                          newDate.setMonth(newDate.getMonth() + 1);
                        }
                        setSelectedDate(newDate);
                      }}
                      className="px-4 py-2 bg-white/20 backdrop-blur rounded-lg hover:bg-white/30 transition-all font-medium"
                    >
                      →
                    </button>
                  </div>
                </div>
                
                {/* View Selector */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentView('day')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      currentView === 'day' 
                        ? 'bg-white text-blue-600' 
                        : 'bg-white/20 hover:bg-white/30'
                    }`}
                  >
                    Day
                  </button>
                  <button
                    onClick={() => setCurrentView('week')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      currentView === 'week' 
                        ? 'bg-white text-blue-600' 
                        : 'bg-white/20 hover:bg-white/30'
                    }`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => setCurrentView('month')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      currentView === 'month' 
                        ? 'bg-white text-blue-600' 
                        : 'bg-white/20 hover:bg-white/30'
                    }`}
                  >
                    Month
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="p-6">
                {currentView === 'month' && (
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center text-sm font-bold text-gray-700 py-2">
                        {day}
                      </div>
                    ))}
                  </div>
                )}
                {currentView === 'week' && (
                  <div className="mb-4">
                    {renderCalendar()}
                  </div>
                )}
                {currentView === 'day' && (
                  <div className="mb-4">
                    {renderCalendar()}
                  </div>
                )}
                {currentView === 'month' && (
                  <div className="grid grid-cols-7 gap-2">
                    {renderCalendar()}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block space-y-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="font-bold text-lg mb-4 text-gray-800">Upcoming Events</h3>
              {events.length === 0 ? (
                <p className="text-gray-500 text-sm">No upcoming events</p>
              ) : (
                <div className="space-y-3">
                  {events.slice(0, 5).map(event => (
                    <div key={event.id} className={`border-l-4 ${event.color === 'blue' ? 'border-blue-500' : event.color === 'purple' ? 'border-purple-500' : event.color === 'green' ? 'border-green-500' : event.color === 'orange' ? 'border-orange-500' : event.color === 'pink' ? 'border-pink-500' : 'border-red-500'} pl-4 py-2 bg-gray-50 rounded-r-lg`}>
                      <div className="font-semibold text-sm text-gray-800">{event.title}</div>
                      <div className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                        <Clock size={12} />
                        {event.time}
                      </div>
                      {event.attendees.length > 0 && (
                        <div className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                          <Users size={12} />
                          {event.attendees.length} attendees
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Check size={18} />
                Integration Status
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur px-3 py-2 rounded-lg">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Google Calendar</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur px-3 py-2 rounded-lg">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Apple Calendar (.ics)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Create Event</h2>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="text-white/80 hover:text-white transition-all"
                >
                  <X size={28} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Event Title *</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                  placeholder="Team meeting, Dinner, etc."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">Date *</label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">Time *</label>
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Duration</label>
                <select
                  value={newEvent.duration}
                  onChange={(e) => setNewEvent({ ...newEvent, duration: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                >
                  <option value="60">1 hour</option>
                  <option value="120">2 hours</option>
                  <option value="180">3 hours</option>
                  <option value="240">4 hours</option>
                  <option value="300">5 hours</option>
                  <option value="360">6 hours</option>
                  <option value="420">7 hours</option>
                  <option value="480">8 hours</option>
                  <option value="540">9 hours</option>
                  <option value="600">10 hours</option>
                  <option value="660">11 hours</option>
                  <option value="720">12 hours</option>
                  <option value="780">13 hours</option>
                  <option value="840">14 hours</option>
                  <option value="900">15 hours</option>
                  <option value="960">16 hours</option>
                  <option value="1020">17 hours</option>
                  <option value="1080">18 hours</option>
                  <option value="1140">19 hours</option>
                  <option value="1200">20 hours</option>
                  <option value="1260">21 hours</option>
                  <option value="1320">22 hours</option>
                  <option value="1380">23 hours</option>
                  <option value="1440">24 hours (Full Day)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Event Color</label>
                <div className="flex gap-2">
                  {['blue', 'purple', 'green', 'orange', 'pink', 'red'].map(color => (
                    <button
                      key={color}
                      onClick={() => setNewEvent({ ...newEvent, color })}
                      className={`w-10 h-10 rounded-full ${getColorClass(color)} ${newEvent.color === color ? 'ring-4 ring-gray-300 scale-110' : ''} transition-all`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Attendees</label>
                <input
                  type="text"
                  value={newEvent.attendees}
                  onChange={(e) => setNewEvent({ ...newEvent, attendees: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                  placeholder="email1@example.com, email2@example.com"
                />
                <p className="text-xs text-gray-500 mt-2">Separate multiple emails with commas</p>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                  rows="3"
                  placeholder="Add notes, agenda, or meeting link..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCreateEvent}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl hover:shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 font-medium"
                >
                  <Send size={18} />
                  Create & Send Invites
                </button>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="px-6 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Modal */}
      {showMenuModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end justify-center z-50 lg:hidden">
          <div className="bg-white rounded-t-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Menu</h2>
                <button
                  onClick={() => setShowMenuModal(false)}
                  className="text-white/80 hover:text-white transition-all"
                >
                  <X size={28} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-bold text-lg mb-3 text-gray-800">Upcoming Events</h3>
                {events.length === 0 ? (
                  <p className="text-gray-500 text-sm">No upcoming events</p>
                ) : (
                  <div className="space-y-3">
                    {events.map(event => (
                      <div key={event.id} className={`border-l-4 ${event.color === 'blue' ? 'border-blue-500' : event.color === 'purple' ? 'border-purple-500' : event.color === 'green' ? 'border-green-500' : event.color === 'orange' ? 'border-orange-500' : event.color === 'pink' ? 'border-pink-500' : 'border-red-500'} pl-4 py-2 bg-gray-50 rounded-r-lg`}>
                        <div className="font-semibold text-sm text-gray-800">{event.title}</div>
                        <div className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                          <Clock size={12} />
                          {event.time}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t-2">
                <h3 className="font-bold mb-3 text-gray-800">Integration Status</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 bg-gray-100 px-4 py-3 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium">Google Calendar</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-100 px-4 py-3 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium">Apple Calendar (.ics)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CalendarWithAuth = () => {
  return (
    <AuthWrapper>
      <CalendarPWA />
    </AuthWrapper>
  );
};

export default CalendarWithAuth;
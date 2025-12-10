'use client';


import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Send, Check, X, Menu, Users, Clock } from 'lucide-react';

const CalendarPWA = () => {
  const [currentView, setCurrentView] = useState('calendar');
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
    description: ''
  });

  // Sample events - in real app, these would come from your backend
  useEffect(() => {
    const sampleEvents = [
      {
        id: 1,
        title: 'Team Meeting',
        date: new Date(),
        time: '10:00',
        attendees: ['john@example.com', 'sarah@example.com'],
        status: 'confirmed'
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

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(selectedDate);
    const days = [];
    const today = new Date();
    
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-20 border border-gray-200"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === today.toDateString();
      const dayEvents = events.filter(e => 
        new Date(e.date).toDateString() === date.toDateString()
      );
      
      days.push(
        <div
          key={day}
          className={`h-20 border border-gray-200 p-2 cursor-pointer hover:bg-gray-50 ${
            isToday ? 'bg-blue-50' : ''
          }`}
          onClick={() => {
            setSelectedDate(date);
            setNewEvent({ ...newEvent, date: date.toISOString().split('T')[0] });
          }}
        >
          <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : ''}`}>
            {day}
          </div>
          {dayEvents.map((event, idx) => (
            <div
              key={idx}
              className="text-xs bg-blue-500 text-white rounded px-1 mt-1 truncate"
            >
              {event.title}
            </div>
          ))}
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
      status: 'pending'
    };

    setEvents([...events, event]);
    setShowEventModal(false);
    setNewEvent({
      title: '',
      date: '',
      time: '',
      duration: '60',
      attendees: '',
      description: ''
    });

    // In a real app, this would:
    // 1. Send to your backend
    // 2. Backend creates calendar invite via Google Calendar API
    // 3. Backend sends .ics file via email for Apple Calendar
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="text-blue-600" size={24} />
            <h1 className="text-xl font-bold text-gray-800">MyCalendar</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEventModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">New Event</span>
            </button>
            <button
              onClick={() => setShowMenuModal(true)}
              className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Calendar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow">
              {/* Calendar Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">
                  {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => changeMonth(-1)}
                    className="px-3 py-1 border rounded hover:bg-gray-50"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => setSelectedDate(new Date())}
                    className="px-3 py-1 border rounded hover:bg-gray-50"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => changeMonth(1)}
                    className="px-3 py-1 border rounded hover:bg-gray-50"
                  >
                    →
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="p-4">
                <div className="grid grid-cols-7 gap-0 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-0">
                  {renderCalendar()}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold mb-4">Upcoming Events</h3>
              {events.length === 0 ? (
                <p className="text-gray-500 text-sm">No upcoming events</p>
              ) : (
                <div className="space-y-3">
                  {events.slice(0, 5).map(event => (
                    <div key={event.id} className="border-l-4 border-blue-500 pl-3">
                      <div className="font-medium text-sm">{event.title}</div>
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

            <div className="bg-white rounded-lg shadow p-4 mt-4">
              <h3 className="font-semibold mb-3">Integration Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Google Calendar</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Apple Calendar (.ics)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Create Event</h2>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Event Title *</label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Team meeting, Dinner, etc."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Date *</label>
                    <input
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Time *</label>
                    <input
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                  <select
                    value={newEvent.duration}
                    onChange={(e) => setNewEvent({ ...newEvent, duration: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Attendees</label>
                  <input
                    type="text"
                    value={newEvent.attendees}
                    onChange={(e) => setNewEvent({ ...newEvent, attendees: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="email1@example.com, email2@example.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate multiple emails with commas</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    rows="3"
                    placeholder="Add notes, agenda, or meeting link..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleCreateEvent}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                  >
                    <Send size={18} />
                    Create & Send Invites
                  </button>
                  <button
                    onClick={() => setShowEventModal(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Modal */}
      {showMenuModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 lg:hidden">
          <div className="bg-white rounded-t-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Menu</h2>
                <button
                  onClick={() => setShowMenuModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">Upcoming Events</h3>
                  {events.length === 0 ? (
                    <p className="text-gray-500 text-sm">No upcoming events</p>
                  ) : (
                    <div className="space-y-3">
                      {events.map(event => (
                        <div key={event.id} className="border-l-4 border-blue-500 pl-3">
                          <div className="font-medium text-sm">{event.title}</div>
                          <div className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                            <Clock size={12} />
                            {event.time}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-3">Integration Status</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Google Calendar</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Apple Calendar (.ics)</span>
                    </div>
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

export default CalendarPWA;
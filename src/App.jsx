import React, { useState, useEffect, useRef } from 'react'
import './App.css'
import frankLogo from './assets/frank.png'
import sylLogo from './assets/syl.png'
import pillarLogo from './assets/unnamed.png'

const STORAGE_KEY = 'frank_student_card_data'

const DEFAULT_STUDENT = {
  name: 'Maija Meikäläinen',
  birthdate: '01-01-2001',
  university: 'Helsingin yliopisto',
  studyLevel: 'Korkeakouluopiskelija',
  studentNumber: '29000',
  validityDate: '30.09.2030',
  profilePicture: ''
}

export default function App() {
  // Navigation: 'card' | 'menu' | 'profile' | 'edut' | 'viestit'
  const [activeTab, setActiveTab] = useState('card')
  const [toastMessage, setToastMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const fileInputRef = useRef(null)

  // App splash loading timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1800)
    return () => clearTimeout(timer)
  }, [])

  // Student Data persisted in localStorage
  const [studentData, setStudentData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        return { ...DEFAULT_STUDENT, ...JSON.parse(saved) }
      }
    } catch (e) {
      console.error('Failed to load student data from localStorage', e)
    }
    return DEFAULT_STUDENT
  })

  // Draft state for Profile editing
  const [formData, setFormData] = useState(studentData)

  // Keep formData in sync if studentData changes
  useEffect(() => {
    setFormData(studentData)
  }, [studentData])

  // Dynamically sync status bar / theme color with active tab
  useEffect(() => {
    const topColor = (activeTab === 'menu' || activeTab === 'profile') ? '#e60067' : '#6588d3'
    document.documentElement.style.setProperty('--theme-top-color', topColor)
    const metaTheme = document.querySelector('meta[name="theme-color"]')
    if (metaTheme) metaTheme.setAttribute('content', topColor)
  }, [activeTab])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 2500)
  }

  // Handle image upload and compress to fit easily in localStorage
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxSize = 400
        let width = img.width
        let height = img.height
        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width)
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height)
            height = maxSize
          }
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.88)

        setFormData((prev) => ({ ...prev, profilePicture: compressedBase64 }))
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  }

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, profilePicture: '' }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSaveProfile = (e) => {
    e?.preventDefault()
    setStudentData(formData)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData))
      showToast('Tiedot tallennettu!')
    } catch (err) {
      console.error('Error saving to localStorage', err)
      showToast('Virhe tallennettaessa!')
    }
  }

  const handleResetDefaults = () => {
    if (window.confirm('Haluatko varmasti palauttaa oletustiedot?')) {
      setFormData(DEFAULT_STUDENT)
      setStudentData(DEFAULT_STUDENT)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STUDENT))
        showToast('Oletustiedot palautettu!')
      } catch (err) {
        console.error(err)
      }
    }
  }

  return (
    <div className="phone-container">
      {/* App Splash Loading Screen (Pink with Frank logo) */}
      {isLoading && (
        <div className="app-splash-screen">
          <span className="splash-frank-logo">frank</span>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notification">
          <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
            <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =========================================================================
          VIEW 1: OPISKELIJAKORTTI (CARD)
         ========================================================================= */}
      {activeTab === 'card' && (
        <>
          {/* Top Section (Header + Avatar) */}
          <div className="card-top-section">
            <header className="card-header">
              <div className="header-pill">
                Opiskelijakortti
              </div>
            </header>

            <div className="avatar-section">
              <div className="avatar-glow-wrapper">
                <div className="avatar-circle">
                  <div className="avatar-placeholder">
                    {studentData.profilePicture ? (
                      <img
                        src={studentData.profilePicture}
                        alt="Profiilikuva"
                        className="avatar-custom-img"
                      />
                    ) : (
                      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="40" cy="40" r="40" fill="#e8eef6" />
                        <circle cx="40" cy="30" r="14" fill="#a4b8d1" />
                        <path d="M16 68 C16 54, 26 49, 40 49 C54 49, 64 54, 64 68 Z" fill="#a4b8d1" />
                      </svg>
                    )}
                  </div>

                  {/* Pure diffuse pulsing glow behind Frank badge */}
                  <div className="frank-badge-glow" />

                  {/* Overlapping Frank logo badge */}
                  <div className="frank-badge" title="Frank">
                    <img src={frankLogo} alt="Frank" className="frank-badge-img" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Card Area (Details & Action) */}
          <main className="card-body">
            {/* Student Name & Birthdate */}
            <div className="student-identity">
              <h1 className="student-name">{studentData.name}</h1>
              <p className="student-birthdate">{studentData.birthdate}</p>
            </div>

            {/* Top Divider for Institution Section */}
            <div className="card-divider" />

            {/* University, Level, Student # and SYL Logo */}
            <div className="institution-row">
              <div className="institution-info">
                <p className="university-name">{studentData.university}</p>
                <p className="study-level">{studentData.studyLevel}</p>
                <p className="student-number">{studentData.studentNumber}</p>
              </div>

              <div className="syl-logo-container" title="Suomen ylioppilaskuntien liitto (SYL)">
                <img src={pillarLogo} alt="SYL tunnus" className="syl-pillar-img" />
                <img src={sylLogo} alt="SYL" className="syl-logo-img" />
              </div>
            </div>

            {/* Bottom Divider for Institution Section */}
            <div className="card-divider" />

            {/* Validity Section */}
            <div className="validity-section">
              <div className="status-badge">
                <span className="status-check-circle">
                  <svg viewBox="0 0 16 16" fill="currentColor">
                    <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                  </svg>
                </span>
                <span className="status-text">Voimassa</span>
              </div>

              <div className="validity-date-row">
                <span className="validity-date-number">{studentData.validityDate}</span>
                <span className="validity-date-suffix">asti</span>
              </div>

              {/* Action Button */}
              <button className="inspection-button" type="button">
                Opiskelijakortin tarkastus
              </button>
            </div>
          </main>
        </>
      )}

      {/* =========================================================================
          VIEW 2: MENU PAGE (As shown in screenshot)
         ========================================================================= */}
      {activeTab === 'menu' && (
        <div className="menu-view">
          {/* Magenta/Pink Header with Frank Wordmark */}
          <header className="menu-header">
            <span className="menu-frank-logo">frank</span>
          </header>

          {/* Menu Items List */}
          <div className="menu-list">
            {/* 1. Suosikit */}
            <button className="menu-item" type="button">
              <div className="menu-item-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              <span className="menu-item-label">Suosikit</span>
              <div className="menu-item-chevron">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </button>

            {/* 2. Profiili (Opens Profile editor) */}
            <button
              className="menu-item"
              type="button"
              onClick={() => setActiveTab('profile')}
            >
              <div className="menu-item-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <span className="menu-item-label">Profiili</span>
              <div className="menu-item-chevron">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </button>

            {/* 3. Asiakastuki */}
            <button className="menu-item" type="button">
              <div className="menu-item-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                  <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                </svg>
              </div>
              <span className="menu-item-label">Asiakastuki</span>
              <div className="menu-item-chevron">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </button>

            {/* 4. Kirjaudu ulos */}
            <button className="menu-item" type="button">
              <div className="menu-item-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </div>
              <span className="menu-item-label">Kirjaudu ulos</span>
              <div className="menu-item-chevron">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </button>
          </div>

          {/* Spacer */}
          <div className="menu-spacer" />

          {/* Bottom Footer: Version & Social Buttons */}
          <div className="menu-footer">
            <p className="menu-version-text">Version 4.8.4 (Build 1)</p>
            <div className="menu-social-icons">
              {/* Instagram */}
              <div className="social-circle" aria-label="Instagram">
                <i className="fa-brands fa-instagram" />
              </div>

              {/* Facebook */}
              <div className="social-circle" aria-label="Facebook">
                <i className="fa-brands fa-facebook-f" />
              </div>

              {/* TikTok */}
              <div className="social-circle" aria-label="TikTok">
                <i className="fa-brands fa-tiktok" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 3: PROFIILI EDITOR (Modify University, Student #, Name, DOB, etc.)
         ========================================================================= */}
      {activeTab === 'profile' && (
        <div className="profile-view">
          <header className="profile-header">
            <button
              type="button"
              className="profile-back-button"
              onClick={() => setActiveTab('menu')}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span>Takaisin</span>
            </button>
            <h2 className="profile-header-title">Profiili</h2>
            <div style={{ width: 60 }} />
          </header>

          <form className="profile-body" onSubmit={handleSaveProfile}>
            {/* Avatar section with picture uploader */}
            <div className="profile-avatar-container">
              <div className="profile-avatar-wrapper">
                {formData.profilePicture ? (
                  <img
                    src={formData.profilePicture}
                    alt="Esikatselu"
                    className="profile-avatar-img"
                  />
                ) : (
                  <div className="profile-avatar-default">
                    <svg viewBox="0 0 80 80" fill="none">
                      <circle cx="40" cy="40" r="40" fill="#e8eef6" />
                      <circle cx="40" cy="30" r="14" fill="#a4b8d1" />
                      <path d="M16 68 C16 54, 26 49, 40 49 C54 49, 64 54, 64 68 Z" fill="#a4b8d1" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="profile-avatar-buttons">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />
                <button
                  type="button"
                  className="btn-upload-photo"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <i className="fa-solid fa-camera" />
                  <span>Vaihda kuva</span>
                </button>

                {formData.profilePicture && (
                  <button
                    type="button"
                    className="btn-remove-photo"
                    onClick={handleRemovePhoto}
                  >
                    Poista kuva
                  </button>
                )}
              </div>
            </div>

            {/* Profile Fields */}
            <div className="form-group">
              <label className="form-label" htmlFor="name">
                Nimi
              </label>
              <input
                id="name"
                className="form-input"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Esim. Maija Meikäläinen"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="birthdate">
                Syntymäaika
              </label>
              <input
                id="birthdate"
                className="form-input"
                type="text"
                value={formData.birthdate}
                onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                placeholder="Esim. 01-01-2001"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="university">
                Oppilaitos / Yliopisto
              </label>
              <input
                id="university"
                className="form-input"
                type="text"
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                placeholder="Esim. Helsingin yliopisto"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="studyLevel">
                Koulutustaso
              </label>
              <input
                id="studyLevel"
                className="form-input"
                type="text"
                value={formData.studyLevel}
                onChange={(e) => setFormData({ ...formData, studyLevel: e.target.value })}
                placeholder="Esim. Korkeakouluopiskelija"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="studentNumber">
                Opiskelijanumero
              </label>
              <input
                id="studentNumber"
                className="form-input"
                type="text"
                value={formData.studentNumber}
                onChange={(e) => setFormData({ ...formData, studentNumber: e.target.value })}
                placeholder="Esim. 29000"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="validityDate">
                Voimassaoloaika
              </label>
              <input
                id="validityDate"
                className="form-input"
                type="text"
                value={formData.validityDate}
                onChange={(e) => setFormData({ ...formData, validityDate: e.target.value })}
                placeholder="Esim. 30.09.2030"
              />
            </div>

            {/* Form Actions */}
            <div className="profile-actions">
              <button type="submit" className="btn-save-profile">
                Tallenna muutokset
              </button>

              <button
                type="button"
                className="btn-reset-profile"
                onClick={handleResetDefaults}
              >
                Palauta oletustiedot
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          VIEW 4: EDUT (Student Deals with Skeletal Loading)
         ========================================================================= */}
      {activeTab === 'edut' && (
        <div className="edut-view">
          {/* Header */}
          <header className="edut-header">
            <div className="edut-header-icon" title="Sijainti">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div className="edut-header-pill">
              Opiskelijaedut
            </div>
            <div className="edut-header-icon" title="Haku">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
          </header>

          {/* Categories Horizontal Bar */}
          <div className="edut-categories">
            <span className="edut-category-tab edut-category-tab--active">Suositukset</span>
            <span className="edut-category-tab">Vaatteet & asusteet</span>
            <span className="edut-category-tab">Vapaa-aika & viihde</span>
          </div>

          {/* Skeletal Loading Content (No images) */}
          <div className="edut-content">
            {/* Hero Banner Skeleton */}
            <div className="edut-skeleton-banner skeleton-shimmer" />

            {/* Pagination Dots */}
            <div className="edut-skeleton-dots">
              <div className="edut-skeleton-dot edut-skeleton-dot--active" />
              <div className="edut-skeleton-dot" />
              <div className="edut-skeleton-dot" />
            </div>

            {/* Section Title Skeleton */}
            <div className="edut-skeleton-title-row">
              <div className="edut-skeleton-title skeleton-shimmer" />
              <div className="edut-skeleton-subtitle skeleton-shimmer" />
            </div>

            {/* Two Side-by-Side Card Skeletons */}
            <div className="edut-skeleton-cards">
              <div className="edut-skeleton-card">
                <div className="edut-skeleton-card-img skeleton-shimmer" />
                <div className="edut-skeleton-line edut-skeleton-line--brand skeleton-shimmer" />
                <div className="edut-skeleton-line edut-skeleton-line--text skeleton-shimmer" />
                <div className="edut-skeleton-line edut-skeleton-line--sub skeleton-shimmer" />
                <div className="edut-skeleton-btn" />
              </div>

              <div className="edut-skeleton-card">
                <div className="edut-skeleton-card-img skeleton-shimmer" />
                <div className="edut-skeleton-line edut-skeleton-line--brand skeleton-shimmer" />
                <div className="edut-skeleton-line edut-skeleton-line--text skeleton-shimmer" />
                <div className="edut-skeleton-line edut-skeleton-line--sub skeleton-shimmer" />
                <div className="edut-skeleton-btn" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 5: VIESTIT (Messages View)
         ========================================================================= */}
      {activeTab === 'viestit' && (
        <div className="viestit-view">
          {/* Header */}
          <header className="viestit-header">
            <span className="viestit-header-logo">frank</span>
            <div className="viestit-header-pill">
              Viestit
            </div>
          </header>

          {/* Sub-tabs */}
          <div className="viestit-tabs">
            <span className="viestit-tab viestit-tab--active">Frank</span>
            <span className="viestit-tab">Student Union</span>
          </div>

          {/* Empty State matching screenshot */}
          <div className="viestit-empty-state">
            <p>Ei viestejä, nauti hiljaisuudesta 🤫.</p>
          </div>
        </div>
      )}

      {/* =========================================================================
          BOTTOM NAVIGATION (Edut, Opiskelijakortti, Viestit, Menu)
         ========================================================================= */}
      <nav className="bottom-nav" aria-label="Alapalkin valikko">
        {/* Tab 1: Edut */}
        <button
          className={`nav-item ${activeTab === 'edut' ? 'nav-item--active' : ''}`}
          type="button"
          onClick={() => setActiveTab('edut')}
        >
          <div className="nav-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <circle cx="11" cy="11" r="2.5" />
            </svg>
          </div>
          <span className="nav-label">Edut</span>
          {activeTab === 'edut' && <div className="nav-indicator" />}
        </button>

        {/* Tab 2: Opiskelijakortti */}
        <button
          className={`nav-item ${activeTab === 'card' ? 'nav-item--active' : ''}`}
          type="button"
          onClick={() => setActiveTab('card')}
        >
          <div className="nav-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="15" rx="3" />
              <circle cx="9" cy="11" r="2.3" />
              <path d="M6 16c0-1.6 1.3-2.7 3-2.7s3 1.1 3 2.7" />
              <line x1="14" y1="9.5" x2="18" y2="9.5" />
              <line x1="14" y1="12.5" x2="18" y2="12.5" />
              <line x1="14" y1="15.5" x2="16.5" y2="15.5" />
            </svg>
          </div>
          <span className="nav-label">Opiskelijakortti</span>
          {activeTab === 'card' && <div className="nav-indicator" />}
        </button>

        {/* Tab 3: Viestit */}
        <button
          className={`nav-item ${activeTab === 'viestit' ? 'nav-item--active' : ''}`}
          type="button"
          onClick={() => setActiveTab('viestit')}
        >
          <div className="nav-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <span className="nav-label">Viestit</span>
          {activeTab === 'viestit' && <div className="nav-indicator" />}
        </button>

        {/* Tab 4: Menu */}
        <button
          className={`nav-item ${activeTab === 'menu' || activeTab === 'profile' ? 'nav-item--active' : ''}`}
          type="button"
          onClick={() => setActiveTab('menu')}
        >
          <div className="nav-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="7" x2="20" y2="7" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="17" x2="20" y2="17" />
            </svg>
          </div>
          <span className="nav-label">Menu</span>
          {(activeTab === 'menu' || activeTab === 'profile') && <div className="nav-indicator" />}
        </button>
      </nav>

      {/* iOS Home Indicator Bar */}
      <div className="home-indicator">
        <div className="home-indicator-bar" />
      </div>
    </div>
  )
}

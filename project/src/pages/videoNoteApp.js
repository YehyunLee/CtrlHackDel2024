'use client'

import { useState, useEffect } from 'react'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'

export default function VideoNoteApp() {
  const [isNoteTaking, setIsNoteTaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [error, setError] = useState(null)
  const [isNotesExpanded, setIsNotesExpanded] = useState(false)

  const {
    transcript,
    interimTranscript,
    resetTranscript,
    listening,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition()

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      setError("Browser doesn't support speech recognition.")
    }
  }, [browserSupportsSpeechRecognition])

  const startListening = () => {
    SpeechRecognition.startListening({ continuous: true })
  }

  const stopListening = () => {
    SpeechRecognition.stopListening()
  }

  const toggleNoteTaking = () => {
    if (!isNoteTaking) {
      startListening()
    } else {
      stopListening()
      setIsPaused(false)
    }
    setIsNoteTaking(!isNoteTaking)
  }

  const togglePause = () => {
    setIsPaused(!isPaused)
    if (isPaused) {
      startListening()
    } else {
      stopListening()
    }
  }

  const toggleNotesExpansion = () => {
    setIsNotesExpanded(!isNotesExpanded)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <main className="flex-grow flex flex-col">
        <div className="relative flex-grow">
          <div className="absolute bottom-4 left-4 right-4 flex justify-center space-x-4">
            <button
              onClick={toggleNoteTaking}
              className="p-2 bg-gray-800/80 hover:bg-gray-700/80 rounded-full transition-colors"
              aria-label={isNoteTaking ? "Stop taking notes" : "Start taking notes"}
            >
              {isNoteTaking ? "Stop Taking Notes" : "Start Taking Notes"}
            </button>
            {isNoteTaking && (
              <button
                onClick={togglePause}
                className="p-2 bg-gray-800/80 hover:bg-gray-700/80 rounded-full transition-colors"
                aria-label={isPaused ? "Resume recording" : "Pause recording"}
              >
                {isPaused ? "Resume" : "Pause"}
              </button>
            )}
          </div>
        </div>
        <div className="bg-gray-800 transition-all duration-300 ease-in-out h-1/2">
          <div
            className="flex items-center justify-between p-4 cursor-pointer"
            onClick={toggleNotesExpansion}
          >
            <h2 className="text-lg font-semibold">Generated Notes</h2>
            {error && <p className="text-red-500 text-sm">Error: {error}</p>}
          </div>
          <div className={`px-4 pb-4 ${isNotesExpanded ? 'h-[calc(100%-4rem)] overflow-y-auto' : 'h-0 overflow-hidden'}`}>
            <p className="text-sm text-gray-300">
              {transcript}
              {interimTranscript && <span className="text-gray-500"> ({interimTranscript})</span>}
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
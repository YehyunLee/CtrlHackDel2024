'use client'

import { useState, useRef, useEffect } from 'react'
import { Camera, CameraOff, Mic, MicOff, Pause, Play, StopCircle, ChevronUp, ChevronDown, Image, RefreshCcw } from "lucide-react"
import SpeechToText from 'speech-to-text'
import TextWithLatex from './components/TextWithLatex';
import MermaidChart from './components/MermaidChart';

export default function VideoNoteApp() {
  const [note, setNote] = useState("")
  const [interimTranscript, setInterimTranscript] = useState("")
  const [isNoteTaking, setIsNoteTaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [listener, setListener] = useState(null)
  const [error, setError] = useState(null)
  const [file, setFile] = useState(null)
  const [response, setResponse] = useState(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [videoStream, setVideoStream] = useState(null)
  const [currentDeviceId, setCurrentDeviceId] = useState(null)

  const flowchart = `
  graph LR
  A[Start] --> B{Is it working?}
  B -- Yes --> C[Continue]
  B -- No --> D[Fix it]
  D --> B
  C --> E[End]
`;

  useEffect(() => {
    initializeSpeechToText()
    toggleCamera()
    return () => {
      if (listener) {
        listener.stopListening()
      }
    }
  }, [])

  const initializeSpeechToText = () => {
    try {
      const onFinalised = (text) => {
        setNote(prevNote => prevNote + text + "\n")
        setInterimTranscript("") // Clear interim transcript when finalized
      }

      const onAnythingSaid = (text) => {
        setInterimTranscript(text) // Update interim transcript
      }

      const onEndEvent = () => {
        if (isNoteTaking && !isPaused) {
          startListening()
        }
      }
      // Initialize the listener with onAnythingSaid
      const newListener = new SpeechToText(
        onFinalised,
        onEndEvent,
        onAnythingSaid
      )
      // Set continuous recognition to true
      newListener.recognition.continuous = true

      setListener(newListener)
    } catch (error) {
      console.error("Speech to text initialization error:", error)
      setError(error.message)
    }
  }

  const startListening = () => {
    if (listener) {
      try {
        listener.startListening()
      } catch (error) {
        console.error("Error starting speech recognition:", error)
        setError(error.message)
      }
    }
  }

  const stopListening = () => {
    if (listener) {
      listener.stopListening()
    }
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
          <div className="flex items-center justify-between p-4 cursor-pointer">
            <h2 className="text-lg font-semibold">Generated Notes</h2>
            {error && <p className="text-red-500 text-sm">Error: {error}</p>}
          </div>
          <div className="px-4 pb-4">
            <p className="text-sm text-gray-300">
              {note}
              {interimTranscript && <span className="text-green-500"> ({interimTranscript})</span>}
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
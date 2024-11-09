'use client'

import { useState, useRef, useEffect } from 'react'
import { Camera, Mic, MicOff, Pause, Play, StopCircle, ChevronUp, ChevronDown } from "lucide-react"

export default function VideoNoteApp() {
  const videoRef = useRef(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [note, setNote] = useState("")
  const [isNotesExpanded, setIsNotesExpanded] = useState(false)
  const [speechRecognitionActive, setSpeechRecognitionActive] = useState(false)
  const [recognition, setRecognition] = useState(null)

  useEffect(() => {
    // Check if the window object is available (i.e., we're on the client side)
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        const newRecognition = new SpeechRecognition()
        newRecognition.continuous = true
        newRecognition.interimResults = true

        // Handle recognition results
        newRecognition.onresult = (event) => {
          let transcript = ''
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript
          }
          setNote((prevNote) => prevNote + transcript)
          console.log('Transcript received:', transcript) // DEBUG: Log received speech
        }

        newRecognition.onerror = (event) => {
          console.error("SpeechRecognition error:", event.error) // DEBUG: Log any errors
        }

        setRecognition(newRecognition)
      } else {
        console.error("SpeechRecognition API is not supported in this browser.")
      }
    }
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      console.error("Error accessing the camera and/or microphone:", err) // DEBUG: Log errors
    }
  }

  const startSpeechRecognition = () => {
    if (recognition && !speechRecognitionActive) {
      recognition.start()
      console.log("Speech recognition started.") // DEBUG: Log start
      setSpeechRecognitionActive(true)
    }
  }

  const stopSpeechRecognition = () => {
    if (recognition && speechRecognitionActive) {
      recognition.stop()
      console.log("Speech recognition stopped.") // DEBUG: Log stop
      setSpeechRecognitionActive(false)
    }
  }

  const toggleRecording = () => {
    if (!isRecording) {
      startCamera()
      startSpeechRecognition()
    } else {
      stopSpeechRecognition()
    }
    setIsRecording(!isRecording)
    setIsPaused(false)
  }

  const togglePause = () => {
    setIsPaused(!isPaused)
    if (isPaused) {
      recognition?.start()
      console.log("Speech recognition resumed.") // DEBUG: Log resume
    } else {
      recognition?.stop()
      console.log("Speech recognition paused.") // DEBUG: Log pause
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setIsMuted(!isMuted)
    }
  }

  const toggleNotesExpansion = () => {
    setIsNotesExpanded(!isNotesExpanded)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <main className="flex-grow flex flex-col">
        <div className="relative flex-grow">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isMuted}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-4 right-4 flex justify-center space-x-4">
            <button
              onClick={toggleRecording}
              className="p-2 bg-gray-800/80 hover:bg-gray-700/80 rounded-full transition-colors"
              aria-label={isRecording ? "Stop recording" : "Start recording"}
            >
              {isRecording ? 
                <StopCircle className="h-6 w-6 text-red-500" /> : 
                <Camera className="h-6 w-6 text-white" />
              }
            </button>
            {isRecording && (
              <button
                onClick={togglePause}
                className="p-2 bg-gray-800/80 hover:bg-gray-700/80 rounded-full transition-colors"
                aria-label={isPaused ? "Resume recording" : "Pause recording"}
              >
                {isPaused ? 
                  <Play className="h-6 w-6 text-white" /> : 
                  <Pause className="h-6 w-6 text-white" />
                }
              </button>
            )}
            <button
              onClick={toggleMute}
              className="p-2 bg-gray-800/80 hover:bg-gray-700/80 rounded-full transition-colors"
              aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
            >
              {isMuted ? 
                <MicOff className="h-6 w-6 text-white" /> : 
                <Mic className="h-6 w-6 text-white" />
              }
            </button>
          </div>
        </div>
        <div 
          className={`bg-gray-800 transition-all duration-300 ease-in-out ${isNotesExpanded ? 'h-1/2' : 'h-20'}`}
        >
          <div 
            className="flex items-center justify-between p-4 cursor-pointer"
            onClick={toggleNotesExpansion}
          >
            <h2 className="text-lg font-semibold">Generated Notes</h2>
            {isNotesExpanded ? 
              <ChevronDown className="h-6 w-6" /> : 
              <ChevronUp className="h-6 w-6" />
            }
          </div>
          <div className={`px-4 pb-4 ${isNotesExpanded ? 'h-[calc(100%-4rem)] overflow-y-auto' : 'h-0 overflow-hidden'}`}>
            <p className="text-sm text-gray-300">{note}</p>
          </div>
        </div>
      </main>
    </div>
  )
}

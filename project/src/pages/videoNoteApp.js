'use client'

import { useState, useRef, useEffect } from 'react'
import { Camera, CameraOff, Mic, MicOff, Pause, Play, StopCircle, ChevronUp, ChevronDown, Image, RefreshCcw, Volume } from "lucide-react"
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import TextWithLatex from './components/TextWithLatex'
import MermaidChart from './components/MermaidChart'

export default function VideoNoteApp() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [isNoteTaking, setIsNoteTaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [note, setNote] = useState("")
  const [isNotesExpanded, setIsNotesExpanded] = useState(false)
  const [error, setError] = useState(null)
  const [file, setFile] = useState(null)
  const [response, setResponse] = useState([])
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [videoStream, setVideoStream] = useState(null)
  const [currentDeviceId, setCurrentDeviceId] = useState(null)
  const [isFlashing, setIsFlashing] = useState(false)
  const [isTranscriptSpeaking, setIsTranscriptSpeaking] = useState(false)
  const [isSummarySpeaking, setIsSummarySpeaking] = useState(false)

  const {
    transcript,
    interimTranscript,
    finalTranscript,
    resetTranscript,
    listening,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition({
    continuous: true,
    interimResults: true
  })

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      setError("Browser doesn't support speech recognition.")
    }
    toggleCamera()
  }, [])

  // Update note when final transcript is available
  useEffect(() => {
    if (finalTranscript !== '') {
      setNote(prev => prev + '\n' + finalTranscript)
      resetTranscript()
    }
  }, [finalTranscript])

  const startListening = () => {
    resetTranscript()
    SpeechRecognition.startListening({
      continuous: true,
      interimResults: true
    })
  }

  const stopListening = () => {
    SpeechRecognition.stopListening()
  }

  const toggleCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false })
      setVideoStream(stream)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setCurrentDeviceId('environment')
    } catch (err) {
      console.error("Error accessing the camera:", err)
      setError(err.message)
    }
  }

  const flipCamera = async () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop())
    }
    const newFacingMode = currentDeviceId === 'environment' ? 'user' : 'environment'
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: newFacingMode }, audio: false })
      setVideoStream(stream)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setCurrentDeviceId(newFacingMode)
    } catch (err) {
      console.error("Error flipping camera:", err)
      setError(err.message)
    }
  }


  // Modify speak functions
  const speakTranscript = () => {
    if (isTranscriptSpeaking) {
      window.speechSynthesis.cancel()
      setIsTranscriptSpeaking(false)
    } else {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(note)
        utterance.onend = () => setIsTranscriptSpeaking(false)
        window.speechSynthesis.speak(utterance)
        setIsTranscriptSpeaking(true)
      }
    }
  }

  const speakSummary = () => {
    if (isSummarySpeaking) {
      window.speechSynthesis.cancel()
      setIsSummarySpeaking(false)
    } else {
      if ('speechSynthesis' in window) {
        // Extract text from response objects and join them
        const textToSpeak = response
          .map(item => typeof item === 'string' ? item : item.message || '')
          .filter(Boolean)
          .join('. ');

        const utterance = new SpeechSynthesisUtterance(textToSpeak)
        utterance.onend = () => setIsSummarySpeaking(false)
        window.speechSynthesis.speak(utterance)
        setIsSummarySpeaking(true)
      }
    }
  }


  const takeSnapshot = () => {
    // Trigger flash animation
    setIsFlashing(true)
    setTimeout(() => setIsFlashing(false), 150) // Reset flash after animation

    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => {
        const file = new File([blob], "snapshot.jpg", { type: "image/jpeg" })
        setFile(file)
      }, "image/jpeg")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return
    const formData = new FormData()
    formData.append("file", file)
    formData.append("note", note)

    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      const data = await res.json()
      console.log(data.message)
      setResponse(prev => [...prev, data]) // Append new response to array
      console.log(response)
      console.log(data)

    } catch (error) {
      console.error("Error:", error.message)
      setResponse(prev => [...prev, { message: "Error processing request", error: error.message }])
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
    if (isPaused) {
      startListening()
    } else {
      stopListening()
    }
    setIsPaused(!isPaused)
  }

  const toggleMute = () => {
    if (isMuted) {
      startListening()
    } else {
      stopListening()
    }
    setIsMuted(!isMuted)
  }

  const toggleNotesExpansion = () => {
    setIsNotesExpanded(!isNotesExpanded)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex-grow flex-col">
      <main className="flex flex flex-col">
        <div className="relative flex">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isMuted}
            className="w-full h-full object-cover"
          />
          {/* Flash overlay */}
          <div
            className={`absolute inset-0 bg-white transition-opacity duration-150 pointer-events-none
              ${isFlashing ? 'opacity-50' : 'opacity-0'}`}
          />
          <div className="absolute bottom-4 left-4 right-4 flex justify-center space-x-4">
            <button
              onClick={flipCamera}
              className="p-2 bg-gray-800/80 hover:bg-gray-700/80 rounded-full transition-colors"
              aria-label="Flip camera"
            >
              <RefreshCcw className="h-6 w-6 text-white" />
            </button>
            <button
              onClick={takeSnapshot}
              className="p-2 bg-gray-800/80 hover:bg-gray-700/80 rounded-full transition-colors transform active:scale-90 transition-transform"
              aria-label="Take snapshot"
            >
              <Image className="h-6 w-6 text-white" />
            </button>
            <button
              onClick={toggleNoteTaking}
              className="p-2 bg-gray-800/80 hover:bg-gray-700/80 rounded-full transition-colors"
              aria-label={isNoteTaking ? "Stop taking notes" : "Start taking notes"}
            >
              <StopCircle className={`h-6 w-6 ${isNoteTaking ? 'text-red-500' : 'text-white'}`} />
            </button>
            {isNoteTaking && (
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
          </div>
        </div>
        <div className="bg-gray-800 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Live transcript:</h2>

            <button
              onClick={speakTranscript}
              className={`p-2 rounded-full transition-colors ${isTranscriptSpeaking ? 'bg-green-600' : 'bg-gray-800/80 hover:bg-gray-700/80'}`}
              aria-label={isTranscriptSpeaking ? "Stop speaking transcript" : "Play transcript as sound"}
            >
              {isTranscriptSpeaking ?
                <Volume className="h-6 w-6 text-yellow-500" /> :
                <Volume className="h-6 w-6 text-white" />
              }
            </button>


            {error && <p className="text-red-500 text-sm">Error: {error}</p>}
          </div>
          <div className="px-4 pb-4 h-[calc(100%-4rem)] overflow-y-auto">
            <p className="text-sm text-gray-300 whitespace-pre-wrap">
              {note}
              {interimTranscript && <span className="text-gray-500">{'\n' + interimTranscript}</span>}
            </p>
          </div>
        </div>
      </main>
      <canvas ref={canvasRef} className="hidden"></canvas>
      <footer className="p-4 bg-gray-800">
        <form onSubmit={handleSubmit}>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md w-full"
            disabled={!file}
          >
            Generate Note
          </button>
        </form>
        {response && (
          <div className="mt-4 text-gray-300 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Summaries:</h2>

            <button
              onClick={speakSummary}
              className={`p-2 rounded-full transition-colors ${isSummarySpeaking ? 'bg-green-600' : 'bg-gray-800/80 hover:bg-gray-700/80'}`}
              aria-label={isSummarySpeaking ? "Stop speaking summary" : "Play summary as sound"}
            >
              {isSummarySpeaking ?
                <Volume className="h-6 w-6 text-yellow-500" /> :
                <Volume className="h-6 w-6 text-white" />
              }
            </button>



            {response.map((message, index) => (
              <div key={index}>
                <TextWithLatex text={message.message} />
                {message.flowchart && <MermaidChart chart={message.flowchart} />}
              </div>
            ))}
          </div>
        )}
        {/* {response.length > 0 && <div><MermaidChart chart={response.flowchart} /></div>} */}
      </footer>
    </div>
  )
}
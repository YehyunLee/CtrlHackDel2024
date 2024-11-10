'use client'

import { useState, useRef, useEffect } from 'react'
import { Camera, CameraOff, Mic, MicOff, Pause, Play, StopCircle, ChevronUp, ChevronDown, Image, RefreshCcw } from "lucide-react"
import SpeechToText from 'speech-to-text';

export default function VideoNoteApp() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [isNoteTaking, setIsNoteTaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [note, setNote] = useState("")
  const [interimTranscript, setInterimTranscript] = useState("")
  const [isNotesExpanded, setIsNotesExpanded] = useState(false)
  const [listener, setListener] = useState(null)
  const [error, setError] = useState(null)
  const [file, setFile] = useState(null)
  const [response, setResponse] = useState(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [videoStream, setVideoStream] = useState(null)
  const [currentDeviceId, setCurrentDeviceId] = useState(null)

  useEffect(() => {
    initializeSpeechToText()
    return () => {
      if (listener) {
        listener.stopListening()
      }
    }
  }, [])

  useEffect(() => {
    console.log(file);
  }, [file])

  const initializeSpeechToText = () => {
    try {
      const onFinalised = (text) => {
        setNote(prevNote => prevNote + text + " ")
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

  const toggleCamera = async () => {
    if (!isCameraOn) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: true }) // Start with back camera
        setVideoStream(stream)
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
        setIsCameraOn(true)
        setCurrentDeviceId('environment') // back camera ID
      } catch (err) {
        console.error("Error accessing the camera and/or microphone:", err)
        setError(err.message)
      }
    } else {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop()) // Stop the current stream
      }
      setIsCameraOn(false)
    }
  }

  const flipCamera = async () => {
    if (isCameraOn) {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop()) // Stop current stream
      }
      // Toggle the camera device (front or back)
      const newFacingMode = currentDeviceId === 'environment' ? 'user' : 'environment' // Switch between 'user' (front) and 'environment' (back)
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: newFacingMode }, audio: true })
        setVideoStream(stream)
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
        setCurrentDeviceId(newFacingMode) // Update current camera device ID
      } catch (err) {
        console.error("Error flipping the camera:", err)
        setError(err.message)
      }
    }
  }

  const speakNote = () => {
    if (isSpeaking) {
      // Stop the ongoing speech output
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    } else {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(note)
        utterance.onend = () => {
          // When speech ends, set state to false
          setIsSpeaking(false)
        }
        window.speechSynthesis.speak(utterance)
        setIsSpeaking(true) // Speech is now active
      } else {
        console.error("SpeechSynthesis API is not supported in this browser.")
      }
    }
  }

  const takeSnapshot = () => {
    // console.log("snap")
    // console.log(videoRef.current)
    // console.log(canvasRef.current)
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => {
        const file = new File([blob], "snapshot.jpg", { type: "image/jpeg" })
        // console.log(file);
        setFile(file)
      }, "image/jpeg")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log("Im here");
    // console.log(note);
    if (!file) return;
    // console.log(file);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("note", note);
    console.log(formData);
    console.log(note);

    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        // Handle HTTP errors
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const data = await res.json()
      setResponse(data)
    } catch (error) {
      console.error("Error:", error.message)
      setResponse({ message: "Error processing request", error: error.message })
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

  const toggleMute = () => {
    // Call stopListening() to prevent interference with speech recognition
    // startListening() will be called again when note taking is resumed
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
              onClick={toggleCamera}
              className="p-2 bg-gray-800/80 hover:bg-gray-700/80 rounded-full transition-colors"
              aria-label={isCameraOn ? "Turn off camera" : "Turn on camera"}
            >
              {isCameraOn ?
                <Camera className="h-6 w-6 text-white" /> :
                <CameraOff className="h-6 w-6 text-white" />
              }
            </button>
            <button
              onClick={flipCamera}
              className="p-2 bg-gray-800/80 hover:bg-gray-700/80 rounded-full transition-colors"
              aria-label="Flip camera"
            >
              <RefreshCcw className="h-6 w-6 text-white" />
            </button>
            {isCameraOn && (
              <button
                onClick={takeSnapshot}
                className="p-2 bg-gray-800/80 hover:bg-gray-700/80 rounded-full transition-colors"
                aria-label="Take snapshot"
              >
                <Image className="h-6 w-6 text-white" />
              </button>
            )}
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

            {/* <button
              onClick={speakNote}
              className={`p-2 rounded-full transition-colors ${isSpeaking ? 'bg-green-600' : 'bg-gray-800/80 hover:bg-gray-700/80'
                }`}
              aria-label={isSpeaking ? "Stop speaking note" : "Play note as sound"}
            >
              {isSpeaking ?
                <Volume className="h-6 w-6 text-yellow-500" /> :
                <Volume className="h-6 w-6 text-white" />
              }
            </button> */}



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
            {error && <p className="text-red-500 text-sm">Error: {error}</p>}
            {isNotesExpanded ?
              <ChevronDown className="h-6 w-6" /> :
              <ChevronUp className="h-6 w-6" />
            }
          </div>
          <div className="px-4 pb-4">
            <p className="text-sm text-gray-300">
              {note}</p>
              <span className="text-green-500"> ({interimTranscript})</span>
            
          </div>
        </div>
      </main>
      <canvas ref={canvasRef} className="hidden"></canvas>  {/* Hidden canvas for snapshot */}
      <footer className="p-4 bg-gray-800">
        <form onSubmit={handleSubmit}>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md w-full"
            disabled={!file}
          >
            Submit Snapshot
          </button>
        </form>
        {response && <div className="mt-4 text-center text-gray-300">{JSON.stringify(response, null, 2)}</div>}
      </footer>
    </div>
  )
}

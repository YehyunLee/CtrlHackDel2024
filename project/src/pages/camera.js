'use client'

import { useState, useRef, useEffect } from 'react'
import { Camera, CameraOff, Mic, MicOff, Pause, Play, StopCircle, ChevronUp, ChevronDown, Volume2, VolumeX, Volume } from "lucide-react"

export default function VideoNoteApp() {
  const videoRef = useRef(null)
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [isNoteTaking, setIsNoteTaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isAudioOn, setIsAudioOn] = useState(false)
  const [audioStream, setAudioStream] = useState(null)
  const [note, setNote] = useState("")
  const [interimTranscript, setInterimTranscript] = useState("")
  const [isNotesExpanded, setIsNotesExpanded] = useState(false)
  const [speechRecognitionActive, setSpeechRecognitionActive] = useState(false)
  const [recognition, setRecognition] = useState(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        const newRecognition = new SpeechRecognition()
        newRecognition.continuous = true
        newRecognition.interimResults = true

        newRecognition.onresult = (event) => {
          let interim = ""
          let final = ""

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              final += transcript + " "
            } else {
              interim += transcript + " "
            }
          }

          setNote((prevNote) => prevNote + final)
          setInterimTranscript(interim)
        }

        newRecognition.onerror = (event) => {
          console.error("SpeechRecognition error:", event.error)
        }

        setRecognition(newRecognition)
      } else {
        console.error("SpeechRecognition API is not supported in this browser.")
      }
    }
  }, [])

  const toggleCamera = async () => {
    if (!isCameraOn) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false  // Don't request audio with camera
        })

        if (videoRef.current) {
          // If audio is already on, we need to combine the streams
          if (audioStream) {
            const tracks = [...stream.getTracks(), ...audioStream.getTracks()]
            const combinedStream = new MediaStream(tracks)
            videoRef.current.srcObject = combinedStream
          } else {
            videoRef.current.srcObject = stream
          }
        }
        setIsCameraOn(true)
      } catch (err) {
        console.error("Error accessing the camera:", err)
      }
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        // Only stop video tracks
        videoRef.current.srcObject.getVideoTracks().forEach(track => track.stop())

        // If audio is on, keep the audio stream
        if (audioStream) {
          videoRef.current.srcObject = audioStream
        } else {
          videoRef.current.srcObject = null
        }
      }
      setIsCameraOn(false)
    }
  }

  const toggleAudio = async () => {
    if (!isAudioOn) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false
        })

        if (videoRef.current) {
          // If camera is on, combine with existing video stream
          if (isCameraOn && videoRef.current.srcObject) {
            const videoTracks = videoRef.current.srcObject.getVideoTracks()
            const combinedStream = new MediaStream([...videoTracks, ...stream.getTracks()])
            videoRef.current.srcObject = combinedStream
          } else {
            videoRef.current.srcObject = stream
          }
        }
        setAudioStream(stream)
        setIsAudioOn(true)
      } catch (err) {
        console.error("Error accessing the microphone:", err)
      }
    } else {
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop())

        // If camera is on, keep only video stream
        if (isCameraOn && videoRef.current && videoRef.current.srcObject) {
          const videoTracks = videoRef.current.srcObject.getVideoTracks()
          if (videoTracks.length > 0) {
            const videoOnlyStream = new MediaStream(videoTracks)
            videoRef.current.srcObject = videoOnlyStream
          } else {
            videoRef.current.srcObject = null
          }
        } else {
          if (videoRef.current) {
            videoRef.current.srcObject = null
          }
        }
        setAudioStream(null)
      }
      setIsAudioOn(false)
    }
  }

  const startSpeechRecognition = () => {
    if (recognition && !speechRecognitionActive) {
      recognition.start()
      console.log("Speech recognition started.")
      setSpeechRecognitionActive(true)
    }
  }

  const stopSpeechRecognition = () => {
    if (recognition && speechRecognitionActive) {
      recognition.stop()
      console.log("Speech recognition stopped.")
      setSpeechRecognitionActive(false)
    }
  }

  const toggleNoteTaking = () => {
    if (!isNoteTaking) {
      startSpeechRecognition()
    } else {
      stopSpeechRecognition()
      setIsPaused(false)
    }
    setIsNoteTaking(!isNoteTaking)
  }

  const togglePause = () => {
    setIsPaused(!isPaused)
    if (isPaused) {
      recognition?.start()
      console.log("Speech recognition resumed.")
    } else {
      recognition?.stop()
      console.log("Speech recognition paused.")
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


  const [isSpeaking, setIsSpeaking] = useState(false)

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
              onClick={toggleAudio}
              className="p-2 bg-gray-800/80 hover:bg-gray-700/80 rounded-full transition-colors"
              aria-label={isAudioOn ? "Turn off audio" : "Turn on audio"}
            >
              {isAudioOn ?
                <Volume2 className="h-6 w-6 text-white" /> :
                <VolumeX className="h-6 w-6 text-white" />
              }
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
            <button
              onClick={speakNote}
              className={`p-2 rounded-full transition-colors ${isSpeaking ? 'bg-green-600' : 'bg-gray-800/80 hover:bg-gray-700/80'
                }`}
              aria-label={isSpeaking ? "Stop speaking note" : "Play note as sound"}
            >
              {isSpeaking ?
                <Volume className="h-6 w-6 text-yellow-500" /> :
                <Volume className="h-6 w-6 text-white" />
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
            <p className="text-sm text-gray-300">{note}{interimTranscript && <span className="text-gray-500"> ({interimTranscript})</span>}</p>
          </div>
        </div>
      </main>
    </div>
  )
}
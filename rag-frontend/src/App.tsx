import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  HiDocumentText,
  HiUser,
  HiSparkles,
  HiPaperClip,
  HiChatBubbleLeftRight,
  HiSun,
  HiMoon,
  HiMicrophone,
  HiStop,
  HiArrowUp,
} from "react-icons/hi2";
import logo from "./assets/logo.png";

// Déclaration des types pour Web Speech API
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webkitSpeechRecognition: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SpeechRecognition: any;
  }
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<
    Array<{ type: "user" | "bot"; message: string }>
  >([]);
  const [userQuery, setUserQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // États pour la reconnaissance vocale
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isRecognitionSupported, setIsRecognitionSupported] =
    useState<boolean>(false);
  const [interimTranscript, setInterimTranscript] = useState<string>("");
  const [currentLanguage, setCurrentLanguage] = useState<string>("fr-FR");

  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Initialisation de la reconnaissance vocale
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsRecognitionSupported(true);
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = currentLanguage; // Utilise la langue sélectionnée

      recognition.onstart = () => {
        setIsListening(true);
        setInterimTranscript("");
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setInterimTranscript(interimTranscript);

        if (finalTranscript) {
          setUserQuery((prev) => prev + finalTranscript + " ");
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Erreur de reconnaissance vocale:", event.error);
        setIsListening(false);
        setInterimTranscript("");
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript("");
      };

      recognitionRef.current = recognition;
    }
  }, [currentLanguage]); // Redémarrer quand la langue change

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Fonction pour ajuster automatiquement la hauteur du textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the actual scrollHeight
      textarea.style.height = "auto";

      // Calculate new height with limits
      const scrollHeight = textarea.scrollHeight;
      const minHeight = 52; // hauteur minimale (approximativement 1 ligne + padding)
      const maxHeight = 200; // hauteur maximale (approximativement 5-6 lignes)
      const threeLineHeight = 120; // hauteur approximative pour 3 lignes

      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
      textarea.style.height = `${newHeight}px`;

      // Afficher le scroll seulement si le contenu dépasse 3 lignes
      if (scrollHeight > threeLineHeight) {
        textarea.style.overflowY = "auto";
      } else {
        textarea.style.overflowY = "hidden";
      }
    }
  };

  // useEffect pour ajuster la hauteur quand le contenu change
  useEffect(() => {
    adjustTextareaHeight();
  }, [userQuery, interimTranscript]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      handleUpload(file);
    }
  };

  const handleUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/uploadfile/", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.ok) {
        setTimeout(() => {
          // File uploaded successfully, show success message
          const successMessage = {
            type: "bot" as const,
            message: `Document "${file.name}" uploaded successfully! You can now ask questions about it.`,
          };
          setChatHistory((prev) => [...prev, successMessage]);
        }, 500);
      } else {
        const data = await response.json();
        alert(`Error: ${data.detail || "Unknown error"}`);
        resetUploadState();
      }
    } catch (error) {
      clearInterval(progressInterval);
      alert(`Network error: ${error}`);
      resetUploadState();
    } finally {
      setIsUploading(false);
    }
  };

  const resetUploadState = () => {
    setSelectedFile(null);
    setIsUploading(false);
    setUploadProgress(0);
  };

  const handleChatSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!userQuery.trim()) return;

    const newUserMessage = { type: "user" as const, message: userQuery };
    setChatHistory((prev) => [...prev, newUserMessage]);
    setUserQuery("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userQuery }),
      });

      const data = await response.json();
      const newBotMessage = {
        type: "bot" as const,
        message: data.answer || `Error: ${data.detail || "Unknown error"}`,
      };
      setChatHistory((prev) => [...prev, newBotMessage]);
    } catch (error) {
      const newBotMessage = {
        type: "bot" as const,
        message: `Network error: ${error}`,
      };
      setChatHistory((prev) => [...prev, newBotMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Fonction pour changer la langue de reconnaissance vocale
  const handleLanguageChange = (language: string) => {
    setCurrentLanguage(language);
    // Arrêter l'écoute en cours si active
    if (isListening) {
      stopListening();
    }
  };

  // Langues supportées
  const supportedLanguages = [
    { code: "fr-FR", name: "Français", flag: "🇫🇷" },
    { code: "en-US", name: "English", flag: "🇺🇸" },
    { code: "ar-SA", name: "العربية", flag: "🇸🇦" },
  ];

  // Fonction pour obtenir le placeholder selon la langue
  const getPlaceholder = () => {
    switch (currentLanguage) {
      case "en-US":
        return "Ask something about the document...";
      case "ar-SA":
        return "اسأل شيئاً عن الوثيقة...";
      case "fr-FR":
      default:
        return "Posez une question sur le document...";
    }
  };

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div
          className={`border-b sticky top-0 z-10 backdrop-blur-sm ${
            isDarkMode
              ? "border-gray-700 bg-gray-900/80"
              : "border-gray-200 bg-white/80"
          }`}>
          <div className="max-w-5xl mx-auto px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={logo}
                  alt="DocInsight Logo"
                  className="w-10 h-10 object-contain"
                />
                <h1
                  className={`text-2xl font-bold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>
                  Doc
                  <span
                    className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                    Insight
                  </span>
                </h1>
              </div>

              <div className="flex items-center space-x-3">
                {/* Sélecteur de langue */}
                {isRecognitionSupported && (
                  <div className="relative">
                    <select
                      value={currentLanguage}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                        isDarkMode
                          ? "bg-gray-800 border-gray-600 text-white"
                          : "bg-white border-gray-200 text-gray-900"
                      }`}
                      title="Choisir la langue de reconnaissance vocale">
                      {supportedLanguages.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.flag} {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Bouton thème */}
                <button
                  onClick={toggleDarkMode}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode
                      ? "text-gray-300 hover:text-white hover:bg-gray-800"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                  aria-label="Toggle dark mode">
                  {isDarkMode ? (
                    <HiSun className="text-xl" />
                  ) : (
                    <HiMoon className="text-xl" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-6 py-8" ref={chatHistoryRef}>
            {chatHistory.length === 0 && (
              <div className="text-center py-20">
                <div className="flex justify-center mb-6">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center shadow-sm ${
                      isDarkMode ? "bg-gray-800" : "bg-gray-100"
                    }`}>
                    <HiChatBubbleLeftRight
                      className={`text-3xl ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    />
                  </div>
                </div>
                <h2
                  className={`text-2xl font-bold mb-3 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>
                  Ready to chat!
                </h2>
                <p
                  className={`text-lg ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}>
                  Upload a document using the paperclip icon and start asking
                  questions.
                </p>
              </div>
            )}
            {/* Upload progress indicator */}
            {isUploading && (
              <div className="mb-8">
                <div className="flex items-start space-x-4">
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
                      isDarkMode ? "bg-gray-800" : "bg-gray-100"
                    }`}>
                    <HiDocumentText
                      className={`text-lg ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="inline-block max-w-3xl">
                      <div
                        className={`px-6 py-4 rounded-2xl rounded-tl-sm shadow-sm border ${
                          isDarkMode
                            ? "bg-gray-800 border-gray-700"
                            : "bg-white border-gray-200"
                        }`}>
                        <p
                          className={`leading-relaxed text-base mb-2 ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}>
                          Uploading {selectedFile?.name}...
                        </p>
                        <div
                          className={`w-full h-2 rounded-full overflow-hidden ${
                            isDarkMode ? "bg-gray-700" : "bg-gray-200"
                          }`}>
                          <div
                            className="h-full bg-gray-600 transition-all duration-300 ease-out"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {chatHistory.map((msg, index) => (
              <div key={index} className="mb-8">
                {msg.type === "user" ? (
                  // User message - right side
                  <div className="flex items-start justify-end space-x-4">
                    <div className="flex-1 flex justify-end">
                      <div className="max-w-3xl">
                        <div
                          className={`px-6 py-4 rounded-2xl rounded-tr-sm shadow-sm ${
                            isDarkMode
                              ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white"
                              : "bg-gray-600 text-white"
                          }`}>
                          <p className="leading-relaxed text-base">
                            {msg.message}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
                        isDarkMode
                          ? "bg-gradient-to-br from-blue-600 to-blue-700"
                          : "bg-gray-600"
                      }`}>
                      <HiUser className="text-lg text-white" />
                    </div>
                  </div>
                ) : (
                  // Bot message - left side
                  <div className="flex items-start space-x-4">
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
                        isDarkMode
                          ? "bg-gradient-to-br from-blue-600 to-purple-600"
                          : "bg-gradient-to-br from-blue-500 to-purple-500"
                      }`}>
                      <HiSparkles className="text-lg text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="inline-block max-w-3xl">
                        <div
                          className={`px-6 py-4 rounded-2xl rounded-tl-sm shadow-sm border ${
                            isDarkMode
                              ? "bg-gray-800 border-gray-600 shadow-lg"
                              : "bg-white border-gray-200"
                          }`}>
                          <div
                            className={`prose prose-sm max-w-none ${
                              isDarkMode
                                ? "prose-invert prose-headings:text-gray-100 prose-p:text-gray-200 prose-strong:text-gray-100 prose-code:text-blue-300 prose-code:bg-gray-700"
                                : ""
                            } prose-table:table-auto prose-th:text-left prose-th:font-semibold prose-th:border prose-th:border-gray-300 prose-th:px-4 prose-th:py-2 prose-td:border prose-td:border-gray-300 prose-td:px-4 prose-td:py-2`}>
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                table: ({ children }) => (
                                  <div className="overflow-x-auto my-4">
                                    <table
                                      className={`min-w-full border-collapse border ${
                                        isDarkMode
                                          ? "border-gray-600"
                                          : "border-gray-300"
                                      }`}>
                                      {children}
                                    </table>
                                  </div>
                                ),
                                thead: ({ children }) => (
                                  <thead
                                    className={
                                      isDarkMode
                                        ? "bg-gray-700 border-gray-600"
                                        : "bg-gray-100 border-gray-300"
                                    }>
                                    {children}
                                  </thead>
                                ),
                                th: ({ children }) => (
                                  <th
                                    className={`border px-4 py-2 text-left font-semibold ${
                                      isDarkMode
                                        ? "border-gray-600 text-gray-100 bg-gray-700"
                                        : "border-gray-300 text-gray-900 bg-gray-50"
                                    }`}>
                                    {children}
                                  </th>
                                ),
                                td: ({ children }) => (
                                  <td
                                    className={`border px-4 py-2 ${
                                      isDarkMode
                                        ? "border-gray-600 text-gray-200 bg-gray-800"
                                        : "border-gray-300 text-gray-700 bg-white"
                                    }`}>
                                    {children}
                                  </td>
                                ),
                                tr: ({ children }) => (
                                  <tr
                                    className={
                                      isDarkMode
                                        ? "hover:bg-gray-800"
                                        : "hover:bg-gray-50"
                                    }>
                                    {children}
                                  </tr>
                                ),
                              }}>
                              {msg.message}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="mb-8">
                <div className="flex items-start space-x-4">
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
                      isDarkMode ? "bg-gray-800" : "bg-gray-100"
                    }`}>
                    <HiSparkles
                      className={`text-lg ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="inline-block max-w-3xl">
                      <div
                        className={`px-6 py-4 rounded-2xl rounded-tl-sm shadow-sm border ${
                          isDarkMode
                            ? "bg-gray-800 border-gray-700"
                            : "bg-white border-gray-200"
                        }`}>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input form */}
        <div
          className={`border-t sticky bottom-0 backdrop-blur-sm ${
            isDarkMode
              ? "border-gray-700 bg-gray-900/80"
              : "border-gray-200 bg-white/80"
          }`}>
          <div className="max-w-5xl mx-auto px-6 py-6">
            <form onSubmit={handleChatSubmit} className="flex items-end">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
                disabled={isUploading}
              />
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={
                    userQuery + (interimTranscript ? interimTranscript : "")
                  }
                  onChange={(e) => {
                    setUserQuery(e.target.value);
                    // Ajuster la hauteur après le changement
                    setTimeout(adjustTextareaHeight, 0);
                  }}
                  placeholder={getPlaceholder()}
                  disabled={isLoading}
                  rows={1}
                  style={{ resize: "none" }}
                  className={`w-full border rounded-2xl px-14 py-4 pr-20 text-base shadow-sm transition-all duration-200 focus:outline-none focus:ring-1 ${
                    isDarkMode
                      ? "border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:ring-gray-500 focus:border-gray-500"
                      : "border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:ring-gray-400 focus:border-gray-400"
                  }`}
                  onKeyDown={(e) => {
                    // Permettre le passage à la ligne avec Entrée
                    // Pour envoyer, il faut utiliser le bouton d'envoi
                    if (e.key === "Enter") {
                      // Ne pas empêcher le comportement par défaut, permettre le saut de ligne
                      return;
                    }
                  }}
                />
                <button
                  type="button"
                  className={`absolute left-4 bottom-4 w-8 h-8 transition-colors flex items-center justify-center rounded-full ${
                    isDarkMode
                      ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700"
                      : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  }`}
                  onClick={triggerFileInput}
                  disabled={isUploading}>
                  <HiPaperClip className="text-lg" />
                </button>

                {/* Bouton micro */}
                {isRecognitionSupported && (
                  <button
                    type="button"
                    className={`absolute right-14 bottom-4 w-10 h-10 transition-all duration-200 flex items-center justify-center rounded-xl ${
                      isListening
                        ? isDarkMode
                          ? "text-red-400 bg-red-900/30 hover:bg-red-900/50"
                          : "text-red-500 bg-red-100 hover:bg-red-200"
                        : isDarkMode
                        ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700"
                        : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    } ${isListening ? "animate-pulse" : ""}`}
                    onClick={toggleListening}
                    disabled={isLoading}
                    title={
                      isListening
                        ? "Arrêter l'enregistrement"
                        : `Commencer l'enregistrement vocal (${
                            supportedLanguages.find(
                              (lang) => lang.code === currentLanguage
                            )?.name
                          })`
                    }>
                    {isListening ? (
                      <HiStop className="text-lg" />
                    ) : (
                      <HiMicrophone className="text-lg" />
                    )}
                  </button>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !userQuery.trim()}
                  className="absolute right-3 bottom-4 w-10 h-10 bg-gray-600 text-white rounded-xl hover:bg-gray-500 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md">
                  <HiArrowUp className="text-lg" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

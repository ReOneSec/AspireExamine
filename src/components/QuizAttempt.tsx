import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuizStore } from '../store/quizStore';
import { generatePDF } from '../utils/pdfGenerator';
import { Timer, AlertCircle, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QuizAttempt = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const quiz = useQuizStore((state) => state.quizzes.find(q => q.id === id));
  const { startQuiz, submitAnswer, endQuiz, currentAttempt } = useQuizStore();
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime] = useState(Date.now());
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [aspirantName, setAspirantName] = useState('');

  useEffect(() => {
    if (quiz && (!currentAttempt || currentAttempt.quizId !== quiz.id)) {
      startQuiz(quiz.id);
      setTimeLeft(quiz.questions.length * 60);
    }
  }, [quiz, currentAttempt]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleShowNameDialog();
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  if (!quiz) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">Quiz not found</h3>
      </div>
    );
  }

  const handleShowNameDialog = () => {
    setShowNameDialog(true);
  };

  const handleSubmitWithName = () => {
    const endTime = Date.now();
    endQuiz(endTime);
    const doc = generatePDF(quiz, {
      ...currentAttempt!,
      startTime,
      endTime,
      aspirantName
    });
    doc.save(`${quiz.name}-results.pdf`);
    navigate('/');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const question = quiz.questions[currentQuestion];

  return (
    <>
      <div className="max-w-3xl mx-auto bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{quiz.name}</h2>
          <div className="flex items-center text-gray-700">
            <Timer className="h-5 w-5 mr-2" />
            <span className="font-medium">{formatTime(timeLeft)}</span>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-500">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </span>
            <span className="text-sm text-gray-500">
              {Object.keys(currentAttempt?.answers || {}).length} answered
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full"
              style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">{question.text}</h3>
          {question.imageUrl && (
            <img
              src={question.imageUrl}
              alt="Question"
              className="mb-4 max-w-full h-auto rounded-lg"
            />
          )}
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => submitAnswer(question.id, index)}
                className={`w-full text-left p-4 rounded-lg border ${
                  currentAttempt?.answers[question.id] === index
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                {String.fromCharCode(65 + index)}. {option}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          {currentQuestion < quiz.questions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestion(prev => Math.min(quiz.questions.length - 1, prev + 1))}
              className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleShowNameDialog}
              className="px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700"
            >
              Submit Quiz
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showNameDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
            >
              <h3 className="text-lg font-semibold mb-4">Enter Your Name (Optional)</h3>
              <div className="relative mb-4">
                <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={aspirantName}
                  onChange={(e) => setAspirantName(e.target.value)}
                  placeholder="Your name"
                  className="input-primary pl-10"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleSubmitWithName}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Generate Results
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default QuizAttempt;
import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react'; // Assuming lucide-react is available
import { Analytics } from "@vercel/analytics/react";

const App = () => {
    const [grievance, setGrievance] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [displayScore, setDisplayScore] = useState(0);

    const exampleGrievances = [
        { label: "Loud breathing", text: "My roommate breathes too loudly" },
        { label: "Door holding", text: "Someone didn't say thank you when I held the door" },
        { label: "Fish microwaver", text: "My coworker microwaves fish at lunch" },
        { label: "Wrong TP", text: "They put the toilet paper roll on backwards" }
    ];

    // Function to determine the category based on the score
    const getCategory = (s) => {
        if (s >= 0 && s <= 20) return 'Legitimate Concern';
        if (s >= 21 && s <= 40) return 'Reasonable Gripe';
        if (s >= 41 && s <= 60) return 'Getting Petty';
        if (s >= 61 && s <= 80) return 'Pretty Petty';
        if (s >= 81 && s <= 100) return 'Peak Pettiness';
        return 'Unknown';
    };

    // Function to determine the color for the gauge fill and percentage text
    const getColorForScore = (s) => {
        // Interpolate hue from green (120) to red (0)
        const hue = (1 - (s / 100)) * 120;
        return `hsl(${hue}, 100%, 50%)`;
    };

    const analyzeGrievance = async () => {
        if (!grievance.trim()) {
            setError('Please enter a grievance to analyze!');
            return;
        }

        setLoading(true);
        setError('');
        setResult(null); // Clear previous result
        setDisplayScore(0); // Reset score for animation

        try {
            const prompt = `You are a humorous but fair judge of pettiness. Analyze the following grievance and rate it on a scale from 0 to 100, where:
            - 0-20: Legitimate concern (This is actually serious!)
            - 21-40: Reasonable gripe (Fair enough, that's annoying)
            - 41-60: Getting petty (Okay, but maybe chill a bit?)
            - 61-80: Pretty petty (You might want to let this one go...)
            - 81-100: Peak pettiness (Seriously? Let it go!)

            Grievance: "${grievance}"

            Respond ONLY with a valid JSON object in this exact format:
            {
              "score": [number between 0-100],
              "category": "[one of the category names above]",
              "judgment": "[A funny but not mean 1-2 sentence judgment about their grievance]",
              "advice": "[A humorous but helpful suggestion in 1 sentence]"
            }

            DO NOT OUTPUT ANYTHING OTHER THAN VALID JSON.`;

            let chatHistory = [];
            chatHistory.push({ role: "user", parts: [{ text: prompt }] });
            const payload = {
                contents: chatHistory,
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: "OBJECT",
                        properties: {
                            "score": { "type": "NUMBER" },
                            "category": { "type": "STRING" },
                            "judgment": { "type": "STRING" },
                            "advice": { "type": "STRING" }
                        },
                        required: ["score", "category", "judgment", "advice"]
                    }
                }
            };

            // --- API Key Handling for external deployment with Vite ---
            // Vite exposes environment variables starting with VITE_ via import.meta.env
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

            if (!apiKey) {
                setError('Gemini API Key not found. Please add VITE_GEMINI_API_KEY to your .env file.');
                setLoading(false);
                return;
            }
            // --- End API Key Handling ---

            //const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`; old key
            const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-lite-001:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const resultData = await response.json();

            if (response.ok && resultData.candidates && resultData.candidates.length > 0 &&
                resultData.candidates[0].content && resultData.candidates[0].content.parts &&
                resultData.candidates[0].content.parts.length > 0) {
                const jsonString = resultData.candidates[0].content.parts[0].text;
                const parsedData = JSON.parse(jsonString);

                // Ensure score is within 0-100 range
                const calculatedScore = Math.max(0, Math.min(100, parsedData.score));
                parsedData.score = calculatedScore; // Update score in parsedData
                parsedData.category = getCategory(calculatedScore); // Ensure category matches score ranges

                setResult(parsedData);
                animateScore(parsedData.score);
            } else {
                setError(`API Error: ${resultData.error ? resultData.error.message : 'Unknown error'}. Check your API key and network.`);
                console.error('API Response Error:', resultData); // Log for debugging
            }
        } catch (err) {
            setError('An error occurred while analyzing grievance. Please try again!');
            console.error('Error during API call:', err); // Log for debugging
        } finally {
            setLoading(false);
        }
    };

    const animateScore = (targetScore) => {
        const duration = 1500; // 1.5 seconds
        const startTime = Date.now();
        const startScore = 0;

        const updateScore = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);

            // Ease-out animation
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentScore = Math.round(startScore + (targetScore - startScore) * easeOut);

            setDisplayScore(currentScore);

            if (progress < 1) {
                requestAnimationFrame(updateScore);
            }
        };

        requestAnimationFrame(updateScore);
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-purple-400 to-pink-500 flex flex-col items-center justify-center p-4 font-inter text-gray-800">
            <Analytics />
            <div className="max-w-2xl mx-auto w-full">
                <h1 className="text-5xl font-bold text-center mb-2 text-[#45260C]">

                    How petty are you?
                </h1>
                <p className="text-center mb-8" style={{ color: '#45260C' }}>
                    Share your grievance and let Gemma be the judge
                </p>

                {/* Single Container for Everything */}
                <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
                    {/* Gauge Meter */}
                    <div className="flex flex-col items-center mb-8">
                        <PettinessGauge score={displayScore} getColorForScore={getColorForScore} result={result} />
                    </div>

                    {/* Input Section */}
                    <div className="mb-6">
                        <label className="block text-lg font-semibold mb-3" style={{ color: '#45260C' }}>
                            What's bothering you?
                        </label>

                        {!result ? (
                            <>
                                <textarea
                                    value={grievance}
                                    onChange={(e) => setGrievance(e.target.value)}
                                    placeholder="My roommate ate the last slice of pizza I was saving..."
                                    className="w-full p-4 border-2 rounded-lg focus:outline-none focus:border-orange-500 resize-none" /* Added focus:border-orange-500 */
                                    style={{ borderColor: 'rgba(230, 134, 0, 0.3)' }} /* Removed focusBorderColor */
                                    rows={4}
                                />

                                {/* Example buttons */}
                                <div className="mt-3">
                                    <div className="flex flex-wrap gap-2">
                                        {exampleGrievances.map((example, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setGrievance(example.text)}
                                                className="px-3 py-1 text-sm border rounded-full transition-colors"
                                                style={{
                                                    borderColor: '#E68600',
                                                    color: '#45260C',
                                                    backgroundColor: 'white'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.backgroundColor = '#FFF5EB';
                                                    e.target.style.color = '#E68600';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.backgroundColor = 'white';
                                                    e.target.style.color = '#45260C';
                                                }}
                                            >
                                                {example.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {error && (
                                    <div className="mt-3 flex items-center text-red-600">
                                        <AlertCircle className="w-5 h-5 mr-2" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <button
                                    onClick={analyzeGrievance}
                                    disabled={loading}
                                    className={`mt-4 w-full py-4 rounded-lg font-bold text-white transition-all transform hover:scale-105`}
                                    style={{
                                        backgroundColor: loading ? '#F5A854' : '#E68600',
                                    }}
                                    onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#CC7700')}
                                    onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#E68600')}
                                >
                                    {loading ? 'Analyzing pettiness...' : 'Measure my pettiness!'}
                                </button>
                            </>
                        ) : (
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="italic" style={{ color: '#45260C' }}>"{grievance}"</p>
                            </div>
                        )}
                    </div>

                    {/* Results Section */}
                    {result && (
                        <div className="animate-fadeIn">
                            <div className="border-t border-gray-200 pt-6">
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-lg font-semibold mb-3" style={{ color: '#45260C' }}>Analysis</p>
                                        <div className="bg-orange-50 rounded-lg p-4">
                                            <p style={{ color: '#45260C' }}>
                                                {result.judgment}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-lg font-semibold mb-3" style={{ color: '#45260C' }}>Advice</p>
                                        <div className="bg-orange-100 rounded-lg p-4">
                                            <p style={{ color: '#45260C' }}>
                                                {result.advice}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        setGrievance('');
                                        setResult(null);
                                        setDisplayScore(0);
                                    }}
                                    className="mt-6 w-full py-3 border-2 rounded-lg font-semibold transition-colors"
                                    style={{
                                        borderColor: '#E68600',
                                        color: '#E68600'
                                    }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#FFF5EB'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                >
                                    Try another grievance
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out;
                }
            `}</style>
        </div>
    );
};

// PettinessGauge Component - Adapted to fit the new structure and styling
const PettinessGauge = ({ score, getColorForScore, result }) => {
    const radius = 70; // Radius of the semicircle arc, adjusted to fit viewBox
    const strokeWidth = 20; // Thickness of the gauge line
    const circumference = Math.PI * radius; // Half circumference for semicircle
    const offset = circumference * (1 - (score / 100)); // Offset for stroke-dashoffset to animate

    // SVG coordinates for the semicircle path
    const startX = 100; // Center X of the SVG canvas
    const startY = 100; // Y-coordinate for the base of the semicircle arc (adjusted for new viewBox)

    return (
        <div className="relative w-80 h-48 mb-4">
            <svg viewBox="0 0 200 130" className="w-full h-full">
                {/* Background arc */}
                <path
                    d={`M ${startX - radius} ${startY} A ${radius} ${radius} 0 0 1 ${startX + radius} ${startY}`}
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                />

                {/* Animated fill arc */}
                <path
                    d={`M ${startX - radius} ${startY} A ${radius} ${radius} 0 0 1 ${startX + radius} ${startY}`}
                    fill="none"
                    stroke={getColorForScore(score)} // Dynamic color based on score
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference} // Use full circumference for dasharray
                    strokeDashoffset={offset} // Animate offset
                    className="transition-all duration-1500 ease-out"
                />

                {/* Labels positioned outside the meter */}
                <text x="28" y="125" textAnchor="middle" className="text-xs font-medium" fill="#45260C">0</text>
                <text x="100" y="15" textAnchor="middle" className="text-xs font-medium" fill="#45260C">50</text>
                <text x="172" y="125" textAnchor="middle" className="text-xs font-medium" fill="#45260C">100</text>
            </svg>

            {/* Score display - moved down */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center mt-16"> {/* Adjusted margin-top to move it down */}
                    <span className="text-5xl font-bold block" style={{ color: getColorForScore(score) }}>
                        {score}%
                    </span>
                    {result && (
                        <span className="text-sm font-medium mt-1 block" style={{ color: getColorForScore(score) }}>
                            {result.category}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default App;

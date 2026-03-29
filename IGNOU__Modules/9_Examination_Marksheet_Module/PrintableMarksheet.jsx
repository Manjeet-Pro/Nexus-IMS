import React from 'react';
import { getGrade } from '../utils/gradeUtils';

const PrintableMarksheet = ({ marks, studentData }) => {
    // Calculate overall statistics
    const totalMarksObtained = marks.reduce((sum, m) => sum + m.marks, 0);
    const totalMaxMarks = marks.reduce((sum, m) => sum + m.total, 0);
    const overallPercentage = totalMaxMarks > 0 ? ((totalMarksObtained / totalMaxMarks) * 100).toFixed(2) : 0;

    const overallGrade = getGrade(totalMarksObtained, totalMaxMarks);

    // Formatting Date
    const currentDate = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    return (
        <div className="hidden print:block bg-white text-black font-sans p-0">
            <style>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    /* Scale content slightly to ensure everything fits without cutting */
                    .print-scale {
                        transform: scale(0.98); 
                        transform-origin: top center;
                    }
                }
                .font-serif {
                    font-family: "Times New Roman", Times, serif;
                }
                .corner-decor {
                    position: absolute;
                    width: 20px;
                    height: 20px;
                    border: 4px solid #b8860b;
                }
                .top-left { top: 0; left: 0; border-right: none; border-bottom: none; }
                .top-right { top: 0; right: 0; border-left: none; border-bottom: none; }
                .bottom-left { bottom: 0; left: 0; border-right: none; border-top: none; }
                .bottom-right { bottom: 0; right: 0; border-left: none; border-top: none; }
            `}</style>

            {/* Main Container with flexible height but scaled */}
            <div className="print-scale p-[4mm] min-h-[296mm] box-border relative">
                <div className="h-full border-[3px] border-[#a08040] p-0.5 relative box-border bg-white">
                    {/* Decorative Corners */}
                    <div className="corner-decor top-left"></div>
                    <div className="corner-decor top-right"></div>
                    <div className="corner-decor bottom-left"></div>
                    <div className="corner-decor bottom-right"></div>

                    <div className="h-full border border-dashed border-gray-400 p-2 relative flex flex-col box-border">

                        {/* Header - Compacted */}
                        <div className="flex justify-center items-center mb-2 mt-2">
                            <div className="text-center">
                                {/* Reduced font size to save vertical space */}
                                <h1 className="text-4xl font-extrabold text-[#2c3e50] uppercase tracking-tight leading-tight">NEXUS IMS</h1>

                                <div className="mt-1 inline-block bg-[#d35400] text-white px-8 py-0.5 rounded-sm shadow-md transform -skew-x-12">
                                    <h2 className="text-lg font-bold uppercase transform skew-x-12 tracking-wider">Marksheet</h2>
                                </div>
                            </div>
                        </div>

                        {/* Background Watermark */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none z-0">
                            <h1 className="text-[80px] font-black transform -rotate-12">NEXUS IMS</h1>
                        </div>

                        {/* Student Details - Very Compact Grid */}
                        <div className="relative z-10 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] font-semibold text-gray-800 mb-2 px-1">
                            <div className="flex items-center">
                                <span className="w-24 text-gray-600">Student Name</span>
                                <span className="mr-1">:</span>
                                <span className="uppercase font-bold">{studentData?.name}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-24 text-gray-600">Roll No</span>
                                <span className="mr-1">:</span>
                                <span className="uppercase font-bold">{studentData?.rollNo}</span>
                            </div>

                            <div className="flex items-center">
                                <span className="w-24 text-gray-600">S/O, D/O, W/O</span>
                                <span className="mr-1">:</span>
                                <span className="uppercase">{studentData?.parentName || 'N/A'}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-24 text-gray-600">Marksheet No</span>
                                <span className="mr-1">:</span>
                                <span className="uppercase font-bold">{studentData?.rollNo?.match(/\d+$/)?.[0] || '01'}</span>
                            </div>

                            <div className="flex items-center">
                                <span className="w-24 text-gray-600">Session</span>
                                <span className="mr-1">:</span>
                                <span>{studentData?.year || new Date().getFullYear()}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-24 text-gray-600">Duration</span>
                                <span className="mr-1">:</span>
                                <span>4 Years</span>
                            </div>

                            <div className="flex items-center col-span-2">
                                <span className="w-24 text-gray-600">Course Name</span>
                                <span className="mr-1">:</span>
                                <span className="uppercase font-bold">{studentData?.course}</span>
                            </div>

                        </div>

                        {/* Marks Table - Flex Grow to take available space but compact rows */}
                        <div className="relative z-10 mb-1 px-0 flex-1">
                            <table className="w-full border-collapse border border-gray-600">
                                <thead>
                                    <tr className="bg-[#1e3a8a] text-white text-[9px] uppercase">
                                        <th className="border border-white py-0.5 px-1 w-8">SI.NO</th>
                                        <th className="border border-white py-0.5 px-2 text-left">Course</th>
                                        <th className="border border-white py-0.5 px-1 w-14">Total Marks</th>
                                        <th className="border border-white py-0.5 px-1 w-14">Passing Marks</th>
                                        <th className="border border-white py-0.5 px-1 w-14">Obtain Marks</th>
                                    </tr>
                                </thead>
                                <tbody className="text-[10px] font-medium text-gray-800">
                                    {marks.map((mark, index) => (
                                        <tr key={index} className="text-center bg-white">
                                            <td className="border border-gray-400 py-0.5">{index + 1}</td>
                                            <td className="border border-gray-400 py-0.5 px-2 text-left uppercase truncate max-w-[180px]">{mark.course?.name}</td>
                                            <td className="border border-gray-400 py-0.5">{mark.total}</td>
                                            <td className="border border-gray-400 py-0.5">{Math.ceil(mark.total * 0.40)}</td>
                                            <td className="border border-gray-400 py-0.5 font-bold">{mark.marks}</td>
                                        </tr>
                                    ))}
                                    {/* Total Row */}
                                    <tr className="text-center font-bold bg-gray-50">
                                        <td className="border border-gray-400 py-0.5" colSpan="2">Total</td>
                                        <td className="border border-gray-400 py-0.5">{totalMaxMarks}</td>
                                        <td className="border border-gray-400 py-0.5">{Math.ceil(totalMaxMarks * 0.40)}</td>
                                        <td className="border border-gray-400 py-0.5">{totalMarksObtained}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Footer Section */}
                        <div className="relative z-10 flex items-end justify-between px-1 mt-auto pt-1 mb-0.5">
                            <div className="space-y-0.5 text-[10px] font-bold text-gray-800">
                                <p>Percentage : <span className="ml-1">{overallPercentage}%</span></p>
                                <p>Date of Issue : <span className="ml-1">{currentDate}</span></p>
                                <p>Place : <span className="ml-1 ml-4">India</span></p>
                            </div>

                            {/* Verified Badge - Smaller */}
                            <div className="absolute left-1/2 transform -translate-x-1/2 bottom-1">
                                <div className="border-2 border-green-500 rounded-full p-1 w-16 h-16 flex items-center justify-center transform -rotate-12 bg-white opacity-90 shadow-sm">
                                    <div className="border border-green-500 border-dashed rounded-full w-14 h-14 flex flex-col items-center justify-center">
                                        <div className="flex gap-0.5 mb-0.5">
                                            <div className="w-0.5 h-0.5 bg-green-500 rounded-full"></div>
                                            <div className="w-0.5 h-0.5 bg-green-500 rounded-full"></div>
                                        </div>
                                        <span className="text-green-600 font-black text-[10px] uppercase tracking-wider">VERIFIED</span>
                                        <div className="flex gap-0.5 mt-0.5">
                                            <div className="w-0.5 h-0.5 bg-green-500 rounded-full"></div>
                                            <div className="w-0.5 h-0.5 bg-green-500 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-end">
                                <div className="w-24 h-8 mb-0.5 relative">
                                    {/* Signature Placeholder */}
                                    <svg viewBox="0 0 100 40" className="w-full h-full text-blue-900 opacity-80" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M10,20 Q30,5 50,20 T90,20" />
                                        <path d="M20,25 Q40,10 60,30" />
                                    </svg>
                                </div>
                                <span className="block w-28 border-t border-gray-800 border-dashed"></span>
                                <p className="text-[10px] font-bold mt-0.5 text-center w-28">Director</p>
                            </div>
                        </div>

                        {/* Grade on Right */}
                        <div className="absolute bottom-12 right-2">
                            <p className="font-bold text-[10px]">Grade: {overallGrade}</p>
                        </div>

                        {/* Bottom Disclaimer */}
                        <div className="absolute bottom-0 left-0 w-full text-center">
                            <p className="text-[#3498db] text-[7px] underline cursor-pointer">
                                This certificate may be verified online at NEXUS IMS
                            </p>
                        </div>

                        {/* Corner Stars */}
                        <div className="absolute bottom-2 left-2 text-[#b8860b] text-base">★</div>
                        <div className="absolute bottom-2 right-2 text-[#b8860b] text-base">★</div>
                        <div className="absolute top-2 left-2 text-[#b8860b] text-base">★</div>
                        <div className="absolute top-2 right-2 text-[#b8860b] text-base">★</div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrintableMarksheet;

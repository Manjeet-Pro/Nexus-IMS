export const getGrade = (marks, total) => {
    if (!total || total === 0) return 'F';
    const percentage = (marks / total) * 100;

    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
};

export const getGradeColor = (grade) => {
    const colors = {
        'A+': 'from-green-500 to-emerald-600',
        'A': 'from-green-400 to-green-500',
        'B': 'from-blue-400 to-blue-500',
        'C': 'from-yellow-400 to-yellow-500',
        'D': 'from-orange-400 to-orange-500',
        'F': 'from-red-400 to-red-500'
    };
    return colors[grade] || 'from-gray-400 to-gray-500';
};

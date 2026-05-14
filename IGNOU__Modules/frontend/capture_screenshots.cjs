const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5173';
const OUTPUT_DIR = 'e:\\Nexus\\REPORT_RESOURCES\\ALL_SCREENSHOTS';

const setupDirectories = () => {
    const dirs = ['Public', 'Admin', 'Faculty', 'Student', 'Parent'];
    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    
    dirs.forEach(dir => {
        const fullPath = path.join(OUTPUT_DIR, dir);
        if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
    });
};

const screens = {
    Public: [
        { name: '01_Home', path: '/' },
        { name: '02_Login', path: '/login' },
        { name: '03_Forgot_Password', path: '/forgot-password' },
        { name: '04_About', path: '/about' },
        { name: '05_Contact', path: '/contact' }
    ],
    Admin: [
        { name: '01_Dashboard', path: '/admin' },
        { name: '02_Students', path: '/admin/students' },
        { name: '03_Faculty', path: '/admin/faculty' },
        { name: '04_Parents', path: '/admin/parents' },
        { name: '05_Courses', path: '/admin/courses' },
        { name: '06_Timetable', path: '/admin/timetable' },
        { name: '07_Exams', path: '/admin/exams' },
        { name: '08_Results', path: '/admin/results' },
        { name: '09_Fees', path: '/admin/fees' },
        { name: '10_Notices', path: '/admin/notices' },
        { name: '11_Settings', path: '/admin/settings' }
    ],
    Faculty: [
        { name: '01_Dashboard', path: '/faculty' },
        { name: '02_My_Courses', path: '/faculty/courses' },
        { name: '03_Timetable', path: '/faculty/timetable' },
        { name: '04_Student_Directory', path: '/faculty/directory' },
        { name: '05_Attendance', path: '/faculty/attendance' },
        { name: '06_Add_Marks', path: '/faculty/marks' },
        { name: '07_Settings', path: '/faculty/settings' }
    ],
    Student: [
        { name: '01_Dashboard', path: '/student' },
        { name: '02_My_Courses', path: '/student/courses' },
        { name: '03_Attendance', path: '/student/attendance' },
        { name: '04_Timetable', path: '/student/timetable' },
        { name: '05_My_Fees', path: '/student/fees' },
        { name: '06_My_Exams', path: '/student/exams' },
        { name: '07_My_Results', path: '/student/results' },
        { name: '08_Notices', path: '/student/notices' },
        { name: '09_Settings', path: '/student/settings' }
    ],
    Parent: [
        { name: '01_Dashboard', path: '/parent' },
        { name: '02_Child_Details', path: '/parent/child/STU12345' },
        { name: '03_Parent_Fees', path: '/parent/fees' },
        { name: '04_Parent_Notices', path: '/parent/notices' },
        { name: '05_Settings', path: '/parent/settings' }
    ]
};

const getMockUser = (role) => {
    return {
        _id: 'mock_id_123',
        name: `Mock ${role} User`,
        email: `${role.toLowerCase()}@nexus.com`,
        role: role.toLowerCase(),
        token: 'mock_jwt_token',
        userId: 'USER123',
        department: 'Science',
        semester: 4,
        section: 'A',
        program: 'BCA',
        children: [{_id: 'STU12345', name: 'Mock Child Student', rollNo: 'STU12345'}]
    };
};

async function captureAll() {
    setupDirectories();
    console.log('Directories ready.');

    const browser = await puppeteer.launch({
        headless: "new",
        defaultViewport: { width: 1440, height: 900 }
    });

    const page = await browser.newPage();
    
    // First, navigate to the domain to allow referencing localStorage
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' }).catch(e => console.log('Timeout on base url setup'));
    
    console.log('Capturing Public Pages...');
    for (const screen of screens.Public) {
        await page.evaluate(() => localStorage.removeItem('nexus_auth_user'));
        await page.goto(`${BASE_URL}${screen.path}`, { waitUntil: 'networkidle0', timeout: 30000 }).catch(e => console.log('Timeout on', screen.name));
        await new Promise(r => setTimeout(r, 1000));
        
        const savePath = path.join(OUTPUT_DIR, 'Public', `${screen.name}.png`);
        await page.screenshot({ path: savePath, fullPage: true });
        console.log(`Saved: ${savePath}`);
    }

    const roles = ['Admin', 'Faculty', 'Student', 'Parent'];
    
    for (const role of roles) {
        console.log(`\nCapturing ${role} Portal...`);
        const userObj = getMockUser(role);
        
        // Go back to generic page to inject localstorage safely
        await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
        await page.evaluate((user) => {
            localStorage.setItem('nexus_auth_user', JSON.stringify(user));
        }, userObj);
        
        for (const screen of screens[role]) {
            console.log(`Loading ${screen.name}...`);
            await page.goto(`${BASE_URL}${screen.path}`, { waitUntil: 'networkidle0', timeout: 30000 }).catch(e => console.log('Timeout on', screen.name));
            // Let animations settle
            await new Promise(r => setTimeout(r, 2000));
            
            const savePath = path.join(OUTPUT_DIR, role, `${screen.name}.png`);
            await page.screenshot({ path: savePath, fullPage: true });
            console.log(`Saved: ${savePath}`);
        }
    }

    await browser.close();
    console.log('\n✅ All screenshots captured successfully in ' + OUTPUT_DIR);
}

captureAll().catch(console.error);

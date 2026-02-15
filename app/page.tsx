import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGraduationCap, faUserPlus, faMicrochip, faGear, faCar } from '@fortawesome/free-solid-svg-icons';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation / Header */}
      <nav className="bg-white shadow-sm py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-900 text-white p-2 rounded-lg">
            <FontAwesomeIcon icon={faGraduationCap} className="text-xl" />
          </div>
          <span className="font-bold text-xl text-blue-900 tracking-tight">HTI Portal</span>
        </div>
        <div className="hidden md:flex space-x-6 text-gray-600 font-medium">
          <Link href="#" className="hover:text-blue-900 transition">About</Link>
          <Link href="#" className="hover:text-blue-900 transition">Departments</Link>
          <Link href="#" className="hover:text-blue-900 transition">Contact</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center px-6 py-12 md:py-20 text-center">
        <div className="max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-extrabold text-blue-900 mb-6">
            Higher Technological Institute
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed">
            Leading engineering education in 6th of October City. Join a community of innovators 
            and experts dedicated to shaping the future of technology and industry.
          </p>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Link href="/login" 
              className="px-8 py-4 bg-blue-900 text-white rounded-xl font-bold text-lg hover:bg-blue-800 transition shadow-lg flex items-center justify-center gap-2">
              <FontAwesomeIcon icon={faGraduationCap} />
              Login Portal
            </Link>
            <Link href="/register" 
              className="px-8 py-4 bg-white text-blue-900 border-2 border-blue-900 rounded-xl font-bold text-lg hover:bg-blue-50 transition shadow-md flex items-center justify-center gap-2">
              <FontAwesomeIcon icon={faUserPlus} />
              Student Registration
            </Link>
          </div>

          {/* Departments Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <DepartmentCard 
              icon={faMicrochip} 
              title="Electrical & Communication" 
              desc="Electronics, telecommunications, and smart systems." 
            />
            <DepartmentCard 
              icon={faGear} 
              title="Mechanical Engineering" 
              desc="Design, manufacturing, and industrial energy systems." 
            />
            <DepartmentCard 
              icon={faCar} 
              title="Vehicle Engineering" 
              desc="Automotive design and advanced transport tech." 
            />
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="bg-gray-100 py-6 text-center text-gray-500 text-sm border-t">
        © {new Date().getFullYear()} Higher Technological Institute - 6th of October City
      </footer>
    </div>
  );
}

// Sub-component for Department Cards
function DepartmentCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition group">
      <div className="text-blue-900 mb-4 text-2xl group-hover:scale-110 transition-transform duration-300">
        <FontAwesomeIcon icon={icon} />
      </div>
      <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500">{desc}</p>
    </div>
  );
}
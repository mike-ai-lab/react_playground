import React, { useState, useEffect, useRef } from 'react';

const DEFAULT_CODE = `import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Carousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const images = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop',
    'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?w=1200&h=600&fit=crop',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop',
    'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?w=1200&h=600&fit=crop'
  ];

  return (
    <div className="w-full h-screen flex overflow-hidden relative bg-gray-900">
      {images.map((image, index) => (
        <motion.div
          key={index}
          initial={{ x: index === activeIndex ? 0 : '100%' }}
          animate={{ x: index === activeIndex ? 0 : '100%' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="absolute top-0 left-0 w-full h-full"
          style={{ display: index === activeIndex ? 'block' : 'none' }}
        >
          <img
            src={image}
            alt={\`Image \${index + 1}\`}
            className="w-full h-full object-cover object-center"
          />
        </motion.div>
      ))}
      <div className="absolute top-0 left-0 w-full h-full flex justify-between items-center px-8">
        <button
          className="bg-white/80 p-4 rounded-full hover:bg-white transition-colors duration-200"
          onClick={() => setActiveIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length)}
        >
          <FiChevronLeft size={32} />
        </button>
        <button
          className="bg-white/80 p-4 rounded-full hover:bg-white transition-colors duration-200"
          onClick={() => setActiveIndex((prevIndex) => (prevIndex + 1) % images.length)}
        >
          <FiChevronRight size={32} />
        </button>
      </div>
    </div>
  );
};

export default Carousel;`;

const COUNTER_CODE = `function Counter() {
  const [count, setCount] = React.useState(0);
  
  return (
    <div className="p-8 bg-white rounded-xl shadow-lg max-w-sm mx-auto mt-10">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">Counter App</h1>
      <div className="text-6xl font-bold text-center mb-6">{count}</div>
      <div className="flex gap-2">
        <button 
          onClick={() => setCount(count - 1)}
          className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold"
        >
          Decrease
        </button>
        <button 
          onClick={() => setCount(0)}
          className="flex-1 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold"
        >
          Reset
        </button>
        <button 
          onClick={() => setCount(count + 1)}
          className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold"
        >
          Increase
        </button>
      </div>
    </div>
  );
}

return Counter;`;

const TODO_CODE = `function TodoList() {
  const [todos, setTodos] = React.useState(['Learn React', 'Build a project']);
  const [input, setInput] = React.useState('');
  
  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, input]);
      setInput('');
    }
  };
  
  const removeTodo = (index) => {
    setTodos(todos.filter((_, i) => i !== index));
  };
  
  return (
    <div className="p-8 bg-gradient-to-br from-purple-50 to-blue-50 min-h-screen">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-purple-600 mb-4">My Todo List</h1>
        
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
            placeholder="Add a new task..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button 
            onClick={addTodo}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold"
          >
            Add
          </button>
        </div>
        
        <ul className="space-y-2">
          {todos.map((todo, index) => (
            <li key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <span className="text-gray-700">{todo}</span>
              <button 
                onClick={() => removeTodo(index)}
                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

return TodoList;`;

const COLOR_PICKER_CODE = `function ColorPicker() {
  const [color, setColor] = React.useState('#3b82f6');
  
  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', 
    '#84cc16', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
  ];
  
  return (
    <div className="p-8 min-h-screen flex items-center justify-center" style={{backgroundColor: color}}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Color Picker</h1>
        <p className="text-gray-500 mb-6">Choose your favorite color</p>
        
        <div className="mb-6">
          <div className="text-center mb-4">
            <div className="inline-block px-6 py-3 rounded-lg text-white font-mono text-lg" style={{backgroundColor: color}}>
              {color}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-3">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className="w-full aspect-square rounded-lg transition-transform hover:scale-110 shadow-md"
              style={{backgroundColor: c}}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

return ColorPicker;`;

const LOGIN_CODE = `function LoginForm() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
        <p className="text-gray-500 mb-6">Please login to your account</p>
        
        {submitted && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            Login successful!
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
            />
          </div>
          
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

return LoginForm;`;

const CARD_GALLERY_CODE = `function CardGallery() {
  const [selected, setSelected] = React.useState(null);
  
  const cards = [
    { id: 1, title: 'Mountain View', desc: 'Beautiful mountain landscape', color: 'from-blue-400 to-blue-600' },
    { id: 2, title: 'Ocean Waves', desc: 'Peaceful ocean scenery', color: 'from-cyan-400 to-blue-500' },
    { id: 3, title: 'Forest Path', desc: 'Green forest trail', color: 'from-green-400 to-emerald-600' },
    { id: 4, title: 'Desert Sunset', desc: 'Golden desert view', color: 'from-orange-400 to-red-500' },
    { id: 5, title: 'City Lights', desc: 'Urban night scene', color: 'from-purple-400 to-pink-500' },
    { id: 6, title: 'Aurora Sky', desc: 'Northern lights display', color: 'from-indigo-400 to-purple-600' }
  ];
  
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Image Gallery</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => setSelected(card.id)}
            className={\`cursor-pointer transform transition-all duration-300 \${
              selected === card.id ? 'scale-105 shadow-2xl' : 'hover:scale-105 shadow-lg'
            }\`}
          >
            <div className={\`bg-gradient-to-br \${card.color} rounded-xl p-6 h-48 flex flex-col justify-end text-white\`}>
              <h3 className="text-2xl font-bold mb-2">{card.title}</h3>
              <p className="text-white/90">{card.desc}</p>
            </div>
            {selected === card.id && (
              <div className="bg-white p-4 rounded-b-xl">
                <p className="text-green-600 font-semibold">Selected!</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

return CardGallery;`;

const TYPESCRIPT_CODE = `function TypeScriptDemo() {
  const [count, setCount] = React.useState<number>(0);
  
  const increment = (amount: number): void => {
    setCount(count + amount);
  };
  
  return (
    <div className="p-8 bg-gradient-to-br from-purple-500 to-pink-500 min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-2xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">TypeScript Works!</h1>
        <p className="text-gray-600 mb-6">Type annotations are fully supported</p>
        <div className="text-6xl font-bold text-center mb-6 text-purple-600">{count}</div>
        <div className="flex gap-2">
          <button 
            onClick={() => increment(1)}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold"
          >
            +1
          </button>
          <button 
            onClick={() => increment(5)}
            className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-semibold"
          >
            +5
          </button>
        </div>
      </div>
    </div>
  );
}

return TypeScriptDemo;`;

const ICON_DEMO_CODE = `import React, { useState } from 'react';
import { Heart, Star, Mail } from 'lucide-react';

function IconDemo() {
  const [liked, setLiked] = useState(false);
  const [rating, setRating] = useState(0);
  
  return (
    <div className="p-8 bg-gradient-to-br from-blue-500 to-cyan-500 min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Icons Work!</h1>
        <p className="text-gray-600 mb-6">Lucide imports are mocked automatically</p>
        
        <div className="space-y-4">
          <button 
            onClick={() => setLiked(!liked)}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold"
          >
            <Heart className={liked ? 'fill-current' : ''} />
            {liked ? 'Liked!' : 'Like'}
          </button>
          
          <div className="flex gap-2 justify-center">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => setRating(n)}
                className="p-2"
              >
                <Star className={n <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
              </button>
            ))}
          </div>
          
          <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold">
            <Mail />
            Contact
          </button>
        </div>
      </div>
    </div>
  );
}

export default IconDemo;`;

const ADVANCED_HOOKS_CODE = `import React, { useState, useEffect, useRef } from 'react';

function AdvancedHooks() {
  const [time, setTime] = useState(new Date());
  const [color, setColor] = useState('#3b82f6');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(\`Mouse: \${mousePos.x}, \${mousePos.y}\`, 10, 30);
  }, [color, mousePos]);
  
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
  
  return (
    <div className="p-8 bg-gradient-to-br from-indigo-500 to-purple-500 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Advanced Hooks Work!</h1>
          <p className="text-gray-600 mb-6">useEffect, useRef, and event listeners</p>
          
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-bold text-gray-700 mb-2">Live Clock</h3>
              <div className="text-4xl font-mono text-blue-600">
                {time.toLocaleTimeString()}
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-bold text-gray-700 mb-2">Mouse Position</h3>
              <div className="text-2xl font-mono text-green-600">
                X: {mousePos.x}, Y: {mousePos.y}
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-bold text-gray-700 mb-3">Canvas with useRef</h3>
            <canvas 
              ref={canvasRef} 
              width={600} 
              height={200}
              className="border-2 border-gray-300 rounded-lg w-full"
            />
          </div>
          
          <div>
            <h3 className="font-bold text-gray-700 mb-3">Change Canvas Color</h3>
            <div className="flex gap-2">
              {colors.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-12 h-12 rounded-lg border-2 border-gray-300 hover:scale-110 transition-transform"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdvancedHooks;`;

const ARCHITECTURAL_CODE = `import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Layers, 
  Compass, 
  Home, 
  ArrowUpRight 
} from 'lucide-react';

const PROJECTS = [
  {
    id: 1,
    title: "Najd Modern Villa",
    location: "Riyadh, KSA",
    category: "Architecture",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1600",
    description: "Integrating traditional Salmani architecture with contemporary glass-and-steel minimalism."
  },
  {
    id: 2,
    title: "Luxe Majlis Suite",
    location: "Jeddah, KSA",
    category: "Interior",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1600",
    description: "A reimagined hospitality space blending cultural seating heritage with premium marble finishes."
  },
  {
    id: 3,
    title: "Corporate Oasis Hub",
    location: "NEOM, KSA",
    category: "Design",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1600",
    description: "Biophilic office design focused on sustainability and productivity in extreme climates."
  }
];

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev === PROJECTS.length - 1 ? 0 : prev + 1));
  }, []);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? PROJECTS.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide, isPaused]);

  return (
    <div 
      className="relative h-[70vh] w-full overflow-hidden bg-slate-900 group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {PROJECTS.map((project, idx) => (
        <div
          key={project.id}
          className={\`absolute inset-0 transition-opacity duration-1000 ease-in-out \${
            idx === current ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
          } transform duration-[2000ms]\`}
        >
          <div className="absolute inset-0 bg-black/40 z-10" />
          <img 
            src={project.image} 
            alt={project.title}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 md:p-16 lg:p-24">
        <div className="max-w-3xl overflow-hidden">
          <p className="text-amber-400 font-medium tracking-[0.2em] uppercase mb-4 translate-y-0 animate-pulse">
            {PROJECTS[current].category}
          </p>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            {PROJECTS[current].title}
          </h2>
          <div className="flex items-center gap-4 text-slate-300 mb-8">
            <Compass size={20} className="text-amber-400" />
            <span className="text-lg">{PROJECTS[current].location}</span>
          </div>
          <button className="flex items-center gap-2 px-8 py-4 bg-white text-slate-950 font-bold rounded-sm hover:bg-amber-400 transition-colors duration-300">
            View Project <ArrowUpRight size={20} />
          </button>
        </div>
      </div>

      <div className="absolute bottom-8 right-8 z-30 flex gap-4">
        <button 
          onClick={prevSlide}
          className="p-4 border border-white/20 text-white rounded-full hover:bg-white hover:text-slate-900 transition-all"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          onClick={nextSlide}
          className="p-4 border border-white/20 text-white rounded-full hover:bg-white hover:text-slate-900 transition-all"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      <div className="absolute bottom-0 left-0 w-full z-30 flex">
        {PROJECTS.map((_, idx) => (
          <div 
            key={idx} 
            className="h-1 flex-1 bg-white/20 cursor-pointer"
            onClick={() => setCurrent(idx)}
          >
            <div 
              className={\`h-full bg-amber-400 transition-all duration-300 \${
                idx === current ? 'w-full' : 'w-0'
              }\`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const ServicesSection = () => {
  const services = [
    { title: "Architectural Design", icon: <Home />, desc: "Complete structural concepts from permit to completion." },
    { title: "Interior Mastery", icon: <Layers />, desc: "Tailored luxury interiors for residential and commercial spaces." },
    { title: "Smart Solutions", icon: <Maximize2 />, desc: "Integrating AI and smart tech into modern Middle Eastern living." }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 md:p-16 bg-slate-950">
      {services.map((s, i) => (
        <div 
          key={i} 
          className="group p-8 border border-slate-800 rounded-xl hover:border-amber-400/50 transition-all duration-500 bg-slate-900/50"
        >
          <div className="w-14 h-14 flex items-center justify-center bg-slate-800 rounded-lg text-amber-400 group-hover:bg-amber-400 group-hover:text-slate-900 transition-colors duration-500 mb-6">
            {React.cloneElement(s.icon, { size: 28 })}
          </div>
          <h3 className="text-xl font-bold text-white mb-4">{s.title}</h3>
          <p className="text-slate-400 leading-relaxed">{s.desc}</p>
        </div>
      ))}
    </div>
  );
};

const App = () => {
  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-200 selection:bg-amber-400 selection:text-slate-900">
      <nav className="flex items-center justify-between px-8 py-6 border-b border-slate-900 backdrop-blur-md sticky top-0 z-50">
        <div className="text-2xl font-black tracking-tighter text-white flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-400 rounded-sm" />
          MUHAMAD <span className="text-amber-400 text-sm font-normal tracking-widest ml-1">STUDIO</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium uppercase tracking-widest">
          <a href="#" className="hover:text-amber-400 transition-colors">Portfolios</a>
          <a href="#" className="hover:text-amber-400 transition-colors">Philosophy</a>
          <a href="#" className="hover:text-amber-400 transition-colors">Riyadh Office</a>
        </div>
        <button className="px-6 py-2 border border-amber-400 text-amber-400 rounded-sm hover:bg-amber-400 hover:text-slate-950 transition-all font-bold text-sm">
          CONSULTATION
        </button>
      </nav>

      <main>
        <HeroSlider />
        
        <div className="max-w-7xl mx-auto py-20 px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-amber-400 text-sm font-bold tracking-[0.3em] uppercase mb-4">Our Services</h2>
              <p className="text-3xl md:text-5xl font-bold text-white leading-tight">
                Crafting the future of Arabian living through innovation.
              </p>
            </div>
            <p className="text-slate-400 max-w-sm">
              From the heart of Riyadh, we deliver architectural excellence that honors tradition while embracing the cutting edge.
            </p>
          </div>
          
          <ServicesSection />
        </div>

        <footer className="bg-slate-900 border-t border-slate-800 p-12 text-center">
          <p className="text-slate-500 text-sm mb-4">2024 Muhamad Architectural Business. All rights reserved.</p>
          <div className="flex justify-center gap-6">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <div className="w-2 h-2 rounded-full bg-slate-700" />
            <div className="w-2 h-2 rounded-full bg-slate-700" />
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;`;

const TEMPLATES = [
  { name: 'Carousel', code: DEFAULT_CODE },
  { name: 'Architecture', code: ARCHITECTURAL_CODE },
  { name: 'Counter', code: COUNTER_CODE },
  { name: 'Todo List', code: TODO_CODE },
  { name: 'Color Picker', code: COLOR_PICKER_CODE },
  { name: 'Login Form', code: LOGIN_CODE },
  { name: 'Card Gallery', code: CARD_GALLERY_CODE },
  { name: 'TypeScript', code: TYPESCRIPT_CODE },
  { name: 'Icons', code: ICON_DEMO_CODE },
  { name: 'Advanced Hooks', code: ADVANCED_HOOKS_CODE }
];

export default function App() {
  const [code, setCode] = useState(ARCHITECTURAL_CODE);
  const [previewHTML, setPreviewHTML] = useState('');
  const [error, setError] = useState(null);
  const [babelLoaded, setBabelLoaded] = useState(false);
  const [runKey, setRunKey] = useState(0);
  const [history, setHistory] = useState([]);
  const [showConsole, setShowConsole] = useState(false);
  const [consoleTab, setConsoleTab] = useState('problems'); // 'problems' or 'debug'
  const [problems, setProblems] = useState([]);
  const [autoRun, setAutoRun] = useState(true); // Enable auto-run by default
  const autoRunRef = useRef(true); // Ref to track current autoRun state
  const autoRunTimeoutRef = useRef(null);
  const [currentTemplateIndex, setCurrentTemplateIndex] = useState(1);
  const [templates, setTemplates] = useState(() => {
    const saved = localStorage.getItem('playground-templates');
    return saved ? JSON.parse(saved) : TEMPLATES;
  });
  const [templateValidation, setTemplateValidation] = useState({});
  const [showTemplateList, setShowTemplateList] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [monacoLoaded, setMonacoLoaded] = useState(false);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const iframeRef = useRef(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [codeType, setCodeType] = useState('react');
  const [splitPos, setSplitPos] = useState(50); // percent width for editor pane
  const [isDragging, setIsDragging] = useState(false);
  const [previewMaximized, setPreviewMaximized] = useState(false);
  const splitContainerRef = useRef(null);

  // Load Monaco Editor - matching working implementation
  useEffect(() => {
    if (!editorRef.current || monacoRef.current) return; // Prevent re-initialization

    require.config({ 
      paths: { 
        vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' 
      } 
    });
    
    require(['vs/editor/editor.main'], function() {
      // Check again in case of race condition
      if (monacoRef.current) return;
      
      // Completely disable TypeScript/JavaScript validation
      monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: true,
        noSuggestionDiagnostics: true
      });
      monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: true,
        noSuggestionDiagnostics: true
      });
      
      // Disable compiler options
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        noLib: true,
        allowNonTsExtensions: true
      });
      monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
        noLib: true,
        allowNonTsExtensions: true
      });
      
      // Create editor
      const editor = monaco.editor.create(editorRef.current, {
        value: code,
        language: 'typescript',
        theme: 'vs-dark',
        fontSize: 14,
        fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        scrollbar: {
          vertical: 'visible',
          horizontal: 'visible',
          verticalScrollbarSize: 10,
          horizontalScrollbarSize: 10,
          useShadows: false
        },
        wordWrap: 'on',
        lineNumbers: 'on',
        lineNumbersMinChars: 3,
        glyphMargin: false,
        folding: true,
        renderLineHighlight: 'line',
        hover: { enabled: true },
        quickSuggestions: {
          other: true,
          comments: false,
          strings: false
        },
        suggestOnTriggerCharacters: true,
        acceptSuggestionOnCommitCharacter: false,
        tabSize: 2,
        insertSpaces: true,
        formatOnPaste: true,
        formatOnType: true
      });

      monacoRef.current = editor;

      // Configure undo/redo stack size (limit to 15 actions)
      const model = editor.getModel();
      if (model) {
        // Monaco doesn't have a direct API to limit undo stack, but we can work with what we have
        // The default stack is already reasonable, so we'll just track state
      }

      // Add Select All to context menu
      editor.addAction({
        id: 'select-all-custom',
        label: 'Select All',
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyA],
        contextMenuGroupId: 'navigation',
        contextMenuOrder: 0,
        run: (ed) => {
          const model = ed.getModel();
          const fullRange = model.getFullModelRange();
          ed.setSelection(fullRange);
        }
      });

      editor.onDidChangeModelContent(() => {
        const newCode = editor.getValue();
        setCode(newCode);
        
        // Update undo/redo button states
        const model = editor.getModel();
        if (model) {
          const undoStack = model.getAlternativeVersionId();
          setCanUndo(undoStack > 1);
          setCanRedo(model.canRedo());
        }
        
        // Auto-run with debouncing if enabled (use ref to get current value)
        if (autoRunRef.current) {
          if (autoRunTimeoutRef.current) {
            clearTimeout(autoRunTimeoutRef.current);
          }
          autoRunTimeoutRef.current = setTimeout(() => {
            compileAndRender(newCode);
          }, 1500); // 1.5 seconds debounce
        }
      });

      setMonacoLoaded(true);
    });

    // Cleanup on unmount
    return () => {
      if (monacoRef.current) {
        monacoRef.current.dispose();
        monacoRef.current = null;
      }
    };
  }, []);

  // Babel is loaded from index.html, just initialize on mount
  useEffect(() => {
    if (window.Babel) {
      setBabelLoaded(true);
      compileAndRender(ARCHITECTURAL_CODE);
    }
  }, []);

  // Write HTML into iframe via Blob URL - most reliable cross-browser method
  useEffect(() => {
    if (!previewHTML || !iframeRef.current) return;
    const blob = new Blob([previewHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    iframeRef.current.src = url;
    // Revoke after a delay to allow the iframe to fully load
    const timer = setTimeout(() => URL.revokeObjectURL(url), 10000);
    return () => clearTimeout(timer);
  }, [previewHTML, runKey]);

  // Validate all templates on mount and when templates change
  useEffect(() => {
    if (!babelLoaded) return;
    
    const validateAllTemplates = async () => {
      const validationResults = {};
      
      for (let i = 0; i < templates.length; i++) {
        const template = templates[i];
        try {
          const { cleanCode, mocks } = parseImports(template.code);
          const processedCode = processExports(cleanCode);
          const wrappedCode = `(function() { 
            const React = window.React;
            const { useState, useEffect, useRef, useMemo, useCallback, useReducer, useContext, createContext } = React;
            ${mocks}
            ${processedCode}
          })()`;
          
          window.Babel.transform(wrappedCode, {
            presets: ['react', 'typescript'],
            filename: 'component.tsx'
          });
          
          validationResults[i] = { valid: true, error: null };
        } catch (err) {
          validationResults[i] = { valid: false, error: err.message };
        }
      }
      
      setTemplateValidation(validationResults);
    };
    
    validateAllTemplates();
  }, [templates, babelLoaded]);

  // Resizable split pane drag handlers
  const handleDividerMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e) => {
      if (!splitContainerRef.current) return;
      const rect = splitContainerRef.current.getBoundingClientRect();
      const newPos = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitPos(Math.min(Math.max(newPos, 20), 80));
    };

    const onMouseUp = () => setIsDragging(false);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging]);

  // Detect whether source code is HTML or React/JSX
  const detectCodeType = (sourceCode) => {
    const trimmed = sourceCode.trim();

    // Definitive HTML signals
    const hasDoctype = /^<!DOCTYPE\s+html/i.test(trimmed);
    const hasHtmlTag = /^<html[\s>]/i.test(trimmed);
    const startsWithTag = /^<[a-zA-Z][^>]*>/.test(trimmed);

    if (hasDoctype || hasHtmlTag) return 'html';

    // React signals
    const hasJSX = /<[A-Z][a-zA-Z]*[\s/>]/.test(sourceCode); // JSX component tag
    const hasReactImport = /import\s+.*React|from\s+['"]react['"]/.test(sourceCode);
    const hasJSXReturn = /return\s*\([\s\S]*</.test(sourceCode);
    const hasFunctionComponent = /function\s+[A-Z]|const\s+[A-Z][a-zA-Z]+\s*=\s*(?:\([^)]*\)|[a-zA-Z]+)\s*=>/.test(sourceCode);
    const hasHooks = /\buseState\b|\buseEffect\b|\buseRef\b|\buseCallback\b|\buseMemo\b/.test(sourceCode);

    if (hasReactImport || hasJSX || hasJSXReturn || (hasFunctionComponent && hasHooks)) return 'react';

    // If it starts with an HTML tag but has no React signals, treat as HTML snippet
    if (startsWithTag) return 'html';

    // Default to react
    return 'react';
  };

  // Generate iframe HTML for raw HTML source (full doc or snippet)
  const generateHTMLPreview = (sourceCode) => {
    const trimmed = sourceCode.trim();
    const isFullDoc = /^<!DOCTYPE\s+html/i.test(trimmed) || /^<html[\s>]/i.test(trimmed);

    if (isFullDoc) {
      return trimmed;
    }

    // Wrap snippet in a minimal page with Tailwind available
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { margin: 0; padding: 0; }
  </style>
</head>
<body>
  ${trimmed}
</body>
</html>`;
  };

  const compileAndRender = async (sourceCode) => {
    setError(null);
    setProblems([]); // Clear problems

    const detected = detectCodeType(sourceCode);

    // HTML mode does not need Babel - short circuit early
    if (detected === 'html') {
      setCodeType('html');
      const html = generateHTMLPreview(sourceCode);
      setPreviewHTML(html);
      setRunKey(prev => prev + 1);
      setHistory(prev => [...prev, { time: new Date().toLocaleTimeString(), code: sourceCode, error: null, success: true }]);
      return;
    }

    if (!window.Babel) return;

    const timestamp = new Date().toLocaleTimeString();
    let logEntry = {
      time: timestamp,
      code: sourceCode,
      error: null,
      success: false
    };

    try {
      setCodeType('react');

      // Parse imports and generate mocks
      const { cleanCode, mocks } = parseImports(sourceCode);

      // Process exports
      const processedCode = processExports(cleanCode);

      // Wrap code with React and mocks INSIDE the IIFE
      const wrappedCode = `(function() { 
        const React = window.React;
        const { useState, useEffect, useRef, useMemo, useCallback, useReducer, useContext, createContext } = React;
        ${mocks}
        ${processedCode}
      })()`;

      // Transpile
      const transpiledCode = window.Babel.transform(wrappedCode, {
        presets: ['react', 'typescript'],
        filename: 'component.tsx'
      }).code;

      // Generate preview HTML
      const html = generatePreviewHTML(transpiledCode);
      setPreviewHTML(html);
      setRunKey(prev => prev + 1);
      logEntry.success = true;
    } catch (err) {
      setError(err.message);
      logEntry.error = err.message;
      
      // Add to problems list
      setProblems([{
        severity: 'error',
        message: err.message,
        line: err.loc?.line || 0,
        column: err.loc?.column || 0
      }]);
    }

    setHistory(prev => [...prev, logEntry]);
  };

  const generateIconMock = (iconName) => {
    const iconPaths = {
      ChevronLeft: '<polyline points="15 18 9 12 15 6"></polyline>',
      ChevronRight: '<polyline points="9 18 15 12 9 6"></polyline>',
      ChevronUp: '<polyline points="18 15 12 9 6 15"></polyline>',
      ChevronDown: '<polyline points="6 9 12 15 18 9"></polyline>',
      FiChevronLeft: '<polyline points="15 18 9 12 15 6"></polyline>',
      FiChevronRight: '<polyline points="9 18 15 12 9 6"></polyline>',
      ArrowLeft: '<line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline>',
      ArrowRight: '<line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline>',
      ArrowUp: '<line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline>',
      ArrowDown: '<line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline>',
      ArrowUpRight: '<line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline>',
      Star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>',
      Heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>',
      Menu: '<line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line>',
      X: '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>',
      Check: '<polyline points="20 6 9 17 4 12"></polyline>',
      Plus: '<line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>',
      Minus: '<line x1="5" y1="12" x2="19" y2="12"></line>',
      Home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>',
      Compass: '<circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>',
      Mail: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline>',
      MessageCircle: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>',
      Play: '<polygon points="5 3 19 12 5 21 5 3"></polygon>',
      Pause: '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>',
      Settings: '<circle cx="12" cy="12" r="3"></circle><path d="M12 1v6m0 6v6m5.2-13.2l-4.2 4.2m-2 2l-4.2 4.2m13.2-5.2l-4.2-4.2m-2 2l-4.2-4.2"></path>',
      File: '<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline>',
      Folder: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>',
      Circle: '<circle cx="12" cy="12" r="10"></circle>',
      Square: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>',
      Maximize: '<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>',
      Maximize2: '<polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line>',
      Minimize: '<path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>',
      Layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline>',
      User: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>',
      Users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>',
      Search: '<circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>',
      ShoppingCart: '<circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>'
    };
    
    const path = iconPaths[iconName] || '<circle cx="12" cy="12" r="10"></circle>';
    const escapedPath = path.replace(/"/g, '\\"');
    return `const ${iconName} = (props) => React.createElement('svg', { width: props.size || 24, height: props.size || 24, viewBox: '0 0 24 24', fill: props.fill || 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className: props.className, style: props.style, ...props }, React.createElement('g', { dangerouslySetInnerHTML: { __html: "${escapedPath}" } }));`;
  };

  const parseImports = (code) => {
    const lines = code.split('\n');
    const cleanLines = [];
    const imports = [];
    let inImportBlock = false;
    let currentImport = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('import ')) {
        inImportBlock = true;
        currentImport = line;
        
        // Check if import is complete on this line
        if (line.includes(';') || (line.includes('from') && line.match(/['"]/) && line.match(/['"]/).length >= 2)) {
          inImportBlock = false;
          parseImportLine(currentImport, imports);
          currentImport = '';
        }
        continue;
      }
      
      if (inImportBlock) {
        currentImport += ' ' + line;
        if (line.includes(';') || line.includes('from')) {
          inImportBlock = false;
          parseImportLine(currentImport, imports);
          currentImport = '';
        }
        continue;
      }
      
      cleanLines.push(lines[i]);
    }

    function parseImportLine(importStr, importsArray) {
      const match = importStr.match(/import\s+(?:(\w+)|(?:\{([^}]+)\}))\s+from\s+['"]([^'"]+)['"]/);
      if (match) {
        const defaultImport = match[1];
        const namedImports = match[2];
        const source = match[3];
        
        if (defaultImport) importsArray.push({ name: defaultImport, source });
        if (namedImports) {
          namedImports.split(',').forEach(spec => {
            const cleaned = spec.trim().split(/\s+as\s+/).pop().trim();
            if (cleaned) importsArray.push({ name: cleaned, source });
          });
        }
      }
    }

    // Generate mocks
    const mockSet = new Set();
    const mocks = imports.map(imp => {
      // Skip if already mocked
      if (mockSet.has(imp.name)) return '';
      mockSet.add(imp.name);
      
      // Framer Motion - special handling for motion object and components
      if (imp.source.includes('framer-motion')) {
        if (imp.name === 'motion') {
          return `const motion = { div: (props) => React.createElement('div', props), span: (props) => React.createElement('span', props), img: (props) => React.createElement('img', props), button: (props) => React.createElement('button', props), section: (props) => React.createElement('section', props), article: (props) => React.createElement('article', props), h1: (props) => React.createElement('h1', props), h2: (props) => React.createElement('h2', props), p: (props) => React.createElement('p', props) };`;
        }
        if (imp.name === 'AnimatePresence') {
          return `const AnimatePresence = ({ children, mode, ...props }) => React.createElement('div', props, children);`;
        }
        // Generic framer-motion component mock
        return `const ${imp.name} = (props) => React.createElement('div', props, props.children);`;
      }
      
      // Icon libraries - create specific SVG mocks for common icons
      if (imp.source.includes('lucide') || imp.source.includes('react-icons') || imp.source.includes('fi') || imp.source.includes('fa') || imp.source.includes('md') || imp.source.includes('ai') || imp.source.includes('bi') || imp.source.includes('bs') || imp.source.includes('cg') || imp.source.includes('di') || imp.source.includes('gi') || imp.source.includes('go') || imp.source.includes('gr') || imp.source.includes('hi') || imp.source.includes('im') || imp.source.includes('io') || imp.source.includes('ri') || imp.source.includes('si') || imp.source.includes('tb') || imp.source.includes('ti') || imp.source.includes('vsc') || imp.source.includes('wi')) {
        return generateIconMock(imp.name);
      }
      
      return '';
    }).filter(Boolean).join('\n        ');

    return { cleanCode: cleanLines.join('\n'), mocks };
  };

  const processExports = (code) => {
    let processed = code;
    
    // Find component name in "export default Name"
    let exportDefaultMatch = processed.match(/export\s+default\s+([A-Z][a-zA-Z0-9]*)/);
    let componentName = exportDefaultMatch ? exportDefaultMatch[1] : null;
    
    // Remove export keywords
    processed = processed.replace(/export\s+default\s+/g, '');
    processed = processed.replace(/export\s+/g, '');
    
    // If no component name found from export, try to find the FIRST top-level component declaration
    // This avoids "Cannot access before initialization" errors
    if (!componentName) {
      // Look for function declarations at the start of lines (top-level)
      const lines = processed.split('\n');
      for (let line of lines) {
        const trimmed = line.trim();
        // Match: function ComponentName or const ComponentName = 
        const match = trimmed.match(/^(?:function|const)\s+([A-Z][a-zA-Z0-9]*)/);
        if (match) {
          componentName = match[1];
          break; // Use the first one found
        }
      }
    }
    
    // Ensure IIFE returns the component
    if (componentName) {
      // Remove any existing return statements for this component
      processed = processed.replace(new RegExp(`return\\s+${componentName};?`, 'g'), '');
      processed += `\nreturn ${componentName};`;
    }
    
    return processed.trim();
  };

  const generatePreviewHTML = (transpiledCode) => {
    const encoded = encodeURIComponent(transpiledCode);
    
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { margin: 0; padding: 0; background: #f8fafc; }
    #root { min-height: 100vh; }
    .error-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.95);
      color: white;
      padding: 30px;
      font-family: monospace;
      font-size: 14px;
      overflow: auto;
      z-index: 9999;
    }
    .error-title {
      color: #ef4444;
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 20px;
    }
    .error-content {
      background: #1f2937;
      padding: 20px;
      border-left: 4px solid #ef4444;
      white-space: pre-wrap;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
    (function() {
      try {
        const React = window.React;
        const source = decodeURIComponent("${encoded}");
        
        // Execute the transpiled IIFE which returns the Component
        const Component = eval(source);
        
        if (typeof Component !== 'function') {
          throw new Error('Code evaluation did not return a component function.');
        }

        const root = window.ReactDOM.createRoot(document.getElementById('root'));
        root.render(React.createElement(Component));
      } catch (e) {
        const overlay = document.createElement('div');
        overlay.className = 'error-overlay';
        overlay.innerHTML = '<div class="error-title">Preview Error</div><div class="error-content">' + e.message + '</div>';
        document.body.appendChild(overlay);
      }
    })();
  </script>
</body>
</html>`;
  };

  const handleRunClick = async () => {
    if (!babelLoaded) {
      setError('Compiler still loading');
      return;
    }
    await compileAndRender(code);
  };

  const copyHistoryToClipboard = () => {
    const passed = history.filter(h => h.success).length;
    const failed = history.filter(h => !h.success).length;
    const total = history.length;
    
    let summaryText = '========================================\n';
    summaryText += 'EXECUTION SUMMARY\n';
    summaryText += '========================================\n';
    summaryText += `Total Tests: ${total}\n`;
    summaryText += `Passed: ${passed}\n`;
    summaryText += `Failed: ${failed}\n`;
    summaryText += '========================================\n\n\n';
    
    const historyText = history.map((entry, index) => {
      let text = `========== Test ${index + 1} - ${entry.time} ==========\n\n`;
      text += `CODE:\n${entry.code}\n\n`;
      if (entry.error) {
        text += `ERROR:\n${entry.error}\n`;
      } else {
        text += 'STATUS: Success\n';
      }
      text += '\n' + '='.repeat(50) + '\n\n';
      return text;
    }).join('');
    
    navigator.clipboard.writeText(summaryText + historyText);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const loadTemplate = (index) => {
    const template = templates[index];
    setCode(template.code);
    setCurrentTemplateIndex(index);
    if (monacoRef.current) {
      monacoRef.current.setValue(template.code);
    }
    if (babelLoaded) {
      compileAndRender(template.code);
    }
  };

  const nextTemplate = () => {
    const nextIndex = (currentTemplateIndex + 1) % templates.length;
    loadTemplate(nextIndex);
  };

  const prevTemplate = () => {
    const prevIndex = (currentTemplateIndex - 1 + templates.length) % templates.length;
    loadTemplate(prevIndex);
  };

  const saveTemplate = () => {
    if (!newTemplateName.trim()) {
      alert('Please enter a template name');
      return;
    }
    
    const newTemplate = {
      name: newTemplateName.trim(),
      code: code
    };
    
    const updatedTemplates = [...templates, newTemplate];
    setTemplates(updatedTemplates);
    localStorage.setItem('playground-templates', JSON.stringify(updatedTemplates));
    
    setCurrentTemplateIndex(updatedTemplates.length - 1);
    setShowSaveDialog(false);
    setNewTemplateName('');
  };

  const deleteTemplate = (index) => {
    if (templates.length <= 1) {
      alert('Cannot delete the last template');
      return;
    }
    
    if (!confirm(`Delete template "${templates[index].name}"?`)) {
      return;
    }
    
    const updatedTemplates = templates.filter((_, i) => i !== index);
    setTemplates(updatedTemplates);
    localStorage.setItem('playground-templates', JSON.stringify(updatedTemplates));
    
    if (currentTemplateIndex >= updatedTemplates.length) {
      setCurrentTemplateIndex(updatedTemplates.length - 1);
      loadTemplate(updatedTemplates.length - 1);
    } else if (currentTemplateIndex === index) {
      loadTemplate(0);
    }
  };

  const updateCurrentTemplate = () => {
    const updatedTemplates = [...templates];
    updatedTemplates[currentTemplateIndex] = {
      ...updatedTemplates[currentTemplateIndex],
      code: code
    };
    setTemplates(updatedTemplates);
    localStorage.setItem('playground-templates', JSON.stringify(updatedTemplates));
  };

  const handleUndo = () => {
    if (monacoRef.current && canUndo) {
      monacoRef.current.trigger('keyboard', 'undo', null);
    }
  };

  const handleRedo = () => {
    if (monacoRef.current && canRedo) {
      monacoRef.current.trigger('keyboard', 'redo', null);
    }
  };

  return (
    <div className="flex h-screen font-sans bg-slate-900 overflow-hidden">
      {showTemplateList && (
        <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
          <div className="p-4 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-slate-200 mb-2">Templates</h2>
            <button
              onClick={() => setShowSaveDialog(true)}
              className="w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-sm font-medium transition-colors"
            >
              Save as New
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {templates.map((template, index) => {
              const validation = templateValidation[index];
              const isValid = validation?.valid;
              const isActive = index === currentTemplateIndex;
              
              return (
                <div
                  key={index}
                  className={`p-3 border-b border-slate-700/50 cursor-pointer transition-colors ${
                    isActive ? 'bg-slate-700' : 'hover:bg-slate-750'
                  }`}
                  onClick={() => loadTemplate(index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <div className={`w-2 h-2 rounded-full ${
                        isValid === undefined ? 'bg-gray-500' : isValid ? 'bg-green-500' : 'bg-red-500'
                      }`} title={isValid === undefined ? 'Validating...' : isValid ? 'Valid' : validation.error} />
                      <span className={`text-sm ${isActive ? 'text-white font-medium' : 'text-slate-300'}`}>
                        {template.name}
                      </span>
                    </div>
                    {index >= 10 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTemplate(index);
                        }}
                        className="p-1 hover:bg-red-600 rounded text-slate-400 hover:text-white transition-colors"
                        title="Delete template"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {!isValid && validation && (
                    <div className="mt-1 text-xs text-red-400 truncate" title={validation.error}>
                      {validation.error}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-4 py-2.5 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTemplateList(!showTemplateList)}
              className="p-1.5 hover:bg-slate-800 rounded-md transition-colors group"
              title="Toggle Template List"
            >
              <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="h-4 w-px bg-slate-700"></div>
            <h1 className="font-semibold text-sm text-slate-200">
              React Playground
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {!babelLoaded && <span className="text-xs text-slate-500 mr-2">Loading...</span>}
            <div className="flex items-center gap-1 bg-slate-800/50 rounded-md px-1 py-1">
              <button
                onClick={handleUndo}
                disabled={!canUndo}
                className="p-1.5 hover:bg-slate-700 rounded transition-colors group disabled:opacity-30 disabled:cursor-not-allowed"
                title="Undo (Ctrl+Z)"
              >
                <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </button>
              <button
                onClick={handleRedo}
                disabled={!canRedo}
                className="p-1.5 hover:bg-slate-700 rounded transition-colors group disabled:opacity-30 disabled:cursor-not-allowed"
                title="Redo (Ctrl+Y)"
              >
                <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
                </svg>
              </button>
            </div>
            <div className="h-4 w-px bg-slate-700"></div>
            <label className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 hover:bg-slate-700/50 rounded-md cursor-pointer transition-colors group">
              <input
                type="checkbox"
                checked={autoRun}
                onChange={(e) => {
                  const newValue = e.target.checked;
                  setAutoRun(newValue);
                  autoRunRef.current = newValue; // Update ref immediately
                }}
                className="w-3.5 h-3.5 rounded border-slate-600 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-slate-900 cursor-pointer"
              />
              <span className="text-xs text-slate-300 group-hover:text-white font-medium transition-colors">Auto-Run</span>
            </label>
            <div className="flex items-center gap-1 bg-slate-800/50 rounded-md px-2 py-1">
              <button 
                onClick={prevTemplate}
                className="p-1 hover:bg-slate-700 rounded transition-colors group"
                title="Previous Template"
              >
                <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-xs text-slate-300 font-medium min-w-[100px] text-center px-2">
                {templates[currentTemplateIndex].name}
              </span>
              <button 
                onClick={nextTemplate}
                className="p-1 hover:bg-slate-700 rounded transition-colors group"
                title="Next Template"
              >
                <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="h-4 w-px bg-slate-700"></div>
            <button
              onClick={updateCurrentTemplate}
              className="px-3 py-1.5 bg-blue-600/90 hover:bg-blue-600 text-white text-xs rounded-md font-medium transition-all"
              title="Update current template"
            >
              Update
            </button>
            <button
              onClick={() => setShowSaveDialog(true)}
              className="px-3 py-1.5 bg-emerald-600/90 hover:bg-emerald-600 text-white text-xs rounded-md font-medium transition-all"
            >
              Save As
            </button>
            <button 
              onClick={() => setShowConsole(!showConsole)}
              className="px-3 py-1.5 bg-slate-700/80 hover:bg-slate-700 text-slate-200 text-xs rounded-md font-medium transition-all flex items-center gap-1.5"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Debug Logs {history.length > 0 && `(${history.length})`}
            </button>
            <button 
              onClick={handleRunClick}
              disabled={!babelLoaded}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs rounded-md font-semibold transition-all shadow-sm flex items-center gap-1.5"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              Run
            </button>
          </div>
        </header>

      <main className="flex flex-1 overflow-hidden" ref={splitContainerRef} style={{ cursor: isDragging ? 'col-resize' : 'default' }}>
        <div style={{ width: previewMaximized ? '0%' : `${splitPos}%`, display: previewMaximized ? 'none' : 'flex' }} className="flex flex-col border-r border-slate-700/50 bg-[#1e1e1e] overflow-hidden">
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-800/50 bg-[#1e1e1e]">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Editor {!monacoLoaded && '(Loading...)'}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  if (confirm('Clear all code?')) {
                    setCode('');
                    if (monacoRef.current) {
                      monacoRef.current.setValue('');
                    }
                  }
                }}
                className="px-2 py-1 bg-slate-800/50 hover:bg-red-600/20 text-slate-400 hover:text-red-400 rounded text-[10px] transition-all flex items-center gap-1 group"
                title="Clear code"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="hidden group-hover:inline">Clear</span>
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(code);
                }}
                className="px-2 py-1 bg-slate-800/50 hover:bg-emerald-600/20 text-slate-400 hover:text-emerald-400 rounded text-[10px] transition-all flex items-center gap-1 group"
                title="Copy code to clipboard"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="hidden group-hover:inline">Copy</span>
              </button>
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div ref={editorRef} style={{ flex: 1, width: '100%', minHeight: 0 }} />
            
            {/* Console Panel - at bottom of editor */}
            <div 
              className="border-t border-slate-700/50 bg-slate-900 flex flex-col transition-all duration-300"
              style={{ height: showConsole ? '220px' : '32px' }}
            >
              <div 
                className="h-8 min-h-8 bg-slate-800 text-slate-300 flex items-center justify-between px-3 cursor-pointer text-[10px] font-bold uppercase tracking-wider"
                onClick={() => setShowConsole(!showConsole)}
              >
                <div className="flex items-center gap-2">
                  <svg 
                    className="w-3 h-3 transition-transform"
                    style={{ transform: showConsole ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConsoleTab('problems');
                        if (!showConsole) setShowConsole(true);
                      }}
                      className={`px-2 py-1 rounded transition-colors ${
                        consoleTab === 'problems' 
                          ? 'bg-slate-700 text-white' 
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Problems {problems.length > 0 && `(${problems.length})`}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConsoleTab('debug');
                        if (!showConsole) setShowConsole(true);
                      }}
                      className={`px-2 py-1 rounded transition-colors ${
                        consoleTab === 'debug' 
                          ? 'bg-slate-700 text-white' 
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Debug Logs {history.length > 0 && `(${history.length})`}
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  {consoleTab === 'problems' ? (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setProblems([]);
                      }}
                      disabled={problems.length === 0}
                      className="px-2 py-0.5 text-[9px] bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors"
                    >
                      Clear
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          copyHistoryToClipboard();
                        }}
                        disabled={history.length === 0}
                        className="px-2 py-0.5 text-[9px] bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors"
                      >
                        Copy All
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          clearHistory();
                        }}
                        disabled={history.length === 0}
                        className="px-2 py-0.5 text-[9px] bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors"
                      >
                        Clear
                      </button>
                    </>
                  )}
                </div>
              </div>
              {showConsole && (
                <div className="flex-1 overflow-auto p-3 font-mono text-[11px] text-slate-300 bg-slate-900">
                  {consoleTab === 'problems' ? (
                    // Problems Tab
                    problems.length === 0 ? (
                      <div className="text-slate-500 text-center py-8 flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        No problems found
                      </div>
                    ) : (
                      problems.map((problem, index) => (
                        <div 
                          key={index} 
                          className="mb-2 p-2 bg-slate-800 rounded border-l-4 border-red-500 cursor-pointer hover:bg-slate-700 transition-colors"
                          onClick={() => {
                            if (monacoRef.current && problem.line > 0) {
                              monacoRef.current.revealLineInCenter(problem.line);
                              monacoRef.current.setPosition({ lineNumber: problem.line, column: problem.column || 1 });
                              monacoRef.current.focus();
                            }
                          }}
                          title="Click to navigate to error line"
                        >
                          <div className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <div className="flex-1">
                              <div className="text-red-400 font-semibold text-[10px] mb-1">
                                {problem.severity.toUpperCase()}
                                {problem.line > 0 && ` [Ln ${problem.line}, Col ${problem.column}]`}
                              </div>
                              <div className="text-slate-300 text-[10px]">{problem.message}</div>
                            </div>
                          </div>
                        </div>
                      ))
                    )
                  ) : (
                    // Debug Logs Tab
                    history.length === 0 ? (
                      <div className="text-slate-500 text-center py-8">No execution history yet</div>
                    ) : (
                      history.map((entry, index) => (
                        <div key={index} className="mb-3 pb-3 border-b border-slate-700 last:border-b-0">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-400">Test {index + 1}</span>
                            <span className="text-slate-500 text-[10px]">{entry.time}</span>
                          </div>
                          <div className="bg-slate-800 p-2 rounded mb-2">
                            <div className="text-slate-500 text-[10px] mb-1">CODE:</div>
                            <pre className="text-slate-300 whitespace-pre-wrap text-[10px]">{entry.code}</pre>
                          </div>
                          {entry.error ? (
                            <div className="bg-red-900/30 border border-red-700 p-2 rounded">
                              <div className="text-red-400 text-[10px] mb-1">ERROR:</div>
                              <pre className="text-red-300 whitespace-pre-wrap text-[10px]">{entry.error}</pre>
                            </div>
                          ) : (
                            <div className="bg-green-900/30 border border-green-700 p-2 rounded">
                              <span className="text-green-400 text-[10px]">SUCCESS</span>
                            </div>
                          )}
                        </div>
                      ))
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Resizable divider */}
        {!previewMaximized && (
          <div
            onMouseDown={handleDividerMouseDown}
            className="w-1 bg-slate-700/50 hover:bg-blue-500 active:bg-blue-400 cursor-col-resize flex-shrink-0 transition-colors"
            title="Drag to resize"
          />
        )}

        <div style={{ width: previewMaximized ? '100%' : `${100 - splitPos}%` }} className="relative bg-slate-50 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 bg-white z-10 shadow-sm">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Preview</span>
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                codeType === 'html'
                  ? 'bg-orange-100 text-orange-600'
                  : 'bg-blue-100 text-blue-600'
              }`}>
                {codeType === 'html' ? 'HTML' : 'React'}
              </span>
              <div className="flex items-center gap-1 text-[9px] text-slate-400">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                <span>Live</span>
              </div>
              <button
                onClick={() => setPreviewMaximized(v => !v)}
                className="ml-1 p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                title={previewMaximized ? 'Restore split view' : 'Maximize preview'}
              >
                {previewMaximized ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          <div className="flex-1 relative overflow-hidden">
            {error && (
              <div className="absolute top-6 left-6 right-6 z-20 bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0 text-red-500 mt-0.5">
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Compilation Error</h3>
                    <div className="mt-1 text-sm text-red-700 whitespace-pre-wrap font-mono">
                      {error}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <iframe
              ref={iframeRef}
              className="w-full h-full border-none bg-white"
              title="Preview"
              style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
            />
          </div>
        </div>
      </main>
      </div>

      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-96 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-4">Save Template</h3>
            <input
              type="text"
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && saveTemplate()}
              placeholder="Enter template name..."
              className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-4"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setNewTemplateName('');
                }}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveTemplate}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
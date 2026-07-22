const ButtonGradient = () => {
  return (
    <svg className="block" width={0} height={0}>
      <defs>
        {/* التدرج الأيسر: فيريديان عميق إلى تركواز مشرق */}
        <linearGradient id="btn-left" x1="50%" x2="50%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#004D40" />
          <stop offset="100%" stopColor="#00F5D4" />
        </linearGradient>
        
        {/* التدرج العلوي: تركواز نيون إلى أزرق فيروزي (Cyan) */}
        <linearGradient id="btn-top" x1="100%" x2="0%" y1="50%" y2="50%">
          <stop offset="0%" stopColor="#00F5D4" />
          <stop offset="100%" stopColor="#00B4D8" />
        </linearGradient>
        
        {/* التدرج السفلي: أزرق بحري عميق إلى فيريديان متوسط */}
        <linearGradient id="btn-bottom" x1="100%" x2="0%" y1="50%" y2="50%">
          <stop offset="0%" stopColor="#03045E" />
          <stop offset="100%" stopColor="#0077B6" />
        </linearGradient>
        
        {/* التدرج الأيمن: أزرق سماوي مضيء إلى تركواز نيون */}
        <linearGradient id="btn-right" x1="14.635%" x2="14.635%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#00B4D8" />
          <stop offset="100%" stopColor="#00F5D4" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default ButtonGradient;
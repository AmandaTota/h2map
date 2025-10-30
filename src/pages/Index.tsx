import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  MapPin, Wind, Sun, Droplets, ChevronRight, Leaf, TreePine,
  BarChart3, Shield, Menu, X, Eye, Map
} from "lucide-react";

export default function Index() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-h2-gradient-subtle">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-50 border-b border-h2-light-green">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-[90px]">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-[90px] h-[90px] bg-h2-gradient rounded-lg flex items-center justify-center">
            <img src="/Logo.svg" />
              </div>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-h2-dark hover:text-h2-primary transition-colors">
                Recursos
              </a>
              <a href="#conservation" className="text-h2-dark hover:text-h2-primary transition-colors">
                Conservação
              </a>
              <Link to="/dashboard" className="bg-h2-primary text-white px-4 py-2 rounded-lg hover:bg-h2-medium-green transition-colors">
                Demonstração
              </Link>
            </div>

            <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-h2-light-green">
            <div className="px-4 py-2 space-y-1">
              <a href="#features" className="block px-3 py-2 text-h2-dark hover:text-h2-primary">Recursos</a>
              <a href="#conservation" className="block px-3 py-2 text-h2-dark hover:text-h2-primary">Conservação</a>
              <Link to="/dashboard" className="block px-3 py-2 bg-h2-primary text-white rounded-lg hover:bg-h2-medium-green">
                Demonstração
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center space-x-2 bg-h2-light-green text-h2-dark-green px-3 py-1 rounded-full text-sm font-medium mb-6">
                <Leaf className="w-4 h-4" />
                <span>Energia Renovável Inteligente</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-h2-dark mb-6 leading-tight">
                Georreferenciamento para viabilidade de produção de
                <span className="text-transparent bg-clip-text bg-h2-gradient"> Hidrogênio Verde</span>
              </h1>
              <p className="text-xl text-foreground/70 mb-8 leading-relaxed">
                Analise a viabilidade de instalação de energia eólica e solar usando mapas climáticos avançados. Incluindo unidades de conservação da fauna e flora para desenvolvimento sustentável.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/dashboard" className="bg-h2-primary text-white px-6 py-3 rounded-lg hover:bg-h2-medium-green transition-colors flex items-center justify-center space-x-2">
                  <span>Começar Análise</span>
                  <ChevronRight className="w-5 h-5" />
                </Link>
                <Link to="/feasibility" className="bg-white text-h2-primary px-6 py-3 rounded-lg hover:bg-h2-light-green transition-colors flex items-center justify-center space-x-2 border border-h2-primary">
                  <BarChart3 className="w-5 h-5" />
                  <span>Análise de Viabilidade</span>
                </Link>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-h2-light-green hover:shadow-xl transition-all">
                    <Sun className="w-8 h-8 text-h2-orange mb-3" />
                    <h3 className="font-bold text-h2-dark text-lg mb-2">Energia Solar</h3>
                    <p className="text-sm text-foreground/70">Análise de irradiância solar e potencial fotovoltaico</p>
                  </div>
                  <div className="bg-h2-gradient rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all">
                    <MapPin className="w-8 h-8 mb-3" />
                    <h3 className="font-bold text-lg mb-2">Georreferenciamento Preciso</h3>
                    <p className="text-sm text-white/90">Dados geográficos exatos para planejamento eficiente</p>
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="bg-h2-blue text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
                    <Wind className="w-8 h-8 mb-3" />
                    <h3 className="font-bold text-lg mb-2">Análise Eólica</h3>
                    <p className="text-sm text-white/90">Análise do vento para máximo aproveitamento energético</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-h2-light-green hover:shadow-xl transition-all">
                    <BarChart3 className="w-8 h-8 text-h2-primary mb-3" />
                    <h3 className="font-bold text-h2-dark text-lg mb-2">Dados Climáticos</h3>
                    <p className="text-sm text-foreground/70">Tempo, chuvas, ventos e padrões climáticos</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-h2-dark mb-4">Recursos Avançados de Análise</h2>
            <p className="text-foreground/70 text-lg">Ferramentas completas para análise georreferenciada e tomada de decisão inteligente</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                icon: <MapPin className="w-8 h-8" />, 
                title: "Mapeamento Preciso", 
                description: "Localização ideal para instalação de painéis solares e turbinas eólicas usando GIS avançado",
                color: "bg-h2-gradient"
              },
              { 
                icon: <Wind className="w-8 h-8" />, 
                title: "Análise Eólica", 
                description: "Dados de velocidade do vento, direção e padrões para máximo aproveitamento energético",
                color: "bg-h2-blue" 
              },
              { 
                icon: <Sun className="w-8 h-8" />, 
                title: "Potencial Solar", 
                description: "Medição de irradiância solar, horas de sol e eficiência fotovoltaica por região",
                color: "bg-h2-orange" 
              },
              { 
                icon: <Droplets className="w-8 h-8" />, 
                title: "Dados Climáticos", 
                description: "Análise de chuvas, umidade e condições meteorológicas para viabilidade",
                color: "bg-h2-blue" 
              },
              { 
                icon: <TreePine className="w-8 h-8" />, 
                title: "Unidades de Conservação", 
                description: "Mapeamento de áreas protegidas de fauna e flora para desenvolvimento sustentável",
                color: "bg-h2-vibrant" 
              },
              { 
                icon: <Shield className="w-8 h-8" />, 
                title: "Análise de Riscos", 
                description: "Identificação de áreas de risco e fatores ambientais críticos",
                color: "bg-h2-medium-green" 
              },
            ].map((feature, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white border border-h2-light-green rounded-xl p-6 hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className={`w-16 h-16 ${feature.color} rounded-lg flex items-center justify-center text-white mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-h2-dark mb-2">{feature.title}</h3>
                <p className="text-foreground/70 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Conservation Section */}
      <section id="conservation" className="py-20 px-4 sm:px-6 lg:px-8 bg-h2-gradient-subtle">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-h2-dark mb-4">
                Protegendo a Biodiversidade
              </h2>
              <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
                Nossa plataforma integra dados de unidades de conservação para garantir que o desenvolvimento 
                de energia renovável respeite e proteja os ecossistemas locais.
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              {[
                { icon: <Map className="w-6 h-6" />, text: "Mapeamento de áreas de proteção ambiental" },
                { icon: <TreePine className="w-6 h-6" />, text: "Análise de impacto sobre habitats naturais" },
                { icon: <Wind className="w-6 h-6" />, text: "Identificação de corredores ecológicos" },
                { icon: <Eye className="w-6 h-6" />, text: "Monitoramento de espécies ameaçadas" },
                { icon: <BarChart3 className="w-6 h-6" />, text: "Relatórios de sustentabilidade ambiental" },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start space-x-4 bg-white p-4 rounded-lg shadow-sm border border-h2-light-green"
                >
                  <div className="w-12 h-12 bg-h2-gradient rounded-lg flex items-center justify-center text-white flex-shrink-0">
                    {item.icon}
                  </div>
                  <p className="text-h2-dark font-medium pt-2">{item.text}</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-6"
            >
              {[
                { number: "1.200+", label: "Áreas Protegidas", color: "bg-h2-primary" },
                { number: "350+", label: "Espécies Monitoradas", color: "bg-h2-blue" },
                { number: "85%", label: "Precisão Mapeada", color: "bg-h2-vibrant" },
                { number: "100%", label: "Conformidade Legal", color: "bg-h2-medium-green" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`${stat.color} rounded-xl p-6 text-white shadow-lg`}
                >
                  <div className="text-4xl font-bold mb-2">{stat.number}</div>
                  <div className="text-white/90 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-h2-dark text-white/80 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Droplets className="w-6 h-6 text-h2-vibrant" />
                <span className="text-xl font-bold text-white">H2maps</span>
              </div>
              <p className="text-sm text-white/60">
                Georreferenciamento inteligente para um futuro energético sustentável.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Links Rápidos</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-h2-vibrant transition-colors">Recursos</a></li>
                <li><a href="#conservation" className="hover:text-h2-vibrant transition-colors">Conservação</a></li>
                <li><Link to="/dashboard" className="hover:text-h2-vibrant transition-colors">Demonstração</Link></li>
                <li><Link to="/feasibility" className="hover:text-h2-vibrant transition-colors">Análise de Viabilidade</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Tecnologias</h3>
              <ul className="space-y-2 text-sm text-white/60">
                <li className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Georreferenciamento GIS</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Sun className="w-4 h-4" />
                  <span>Análise Solar</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Wind className="w-4 h-4" />
                  <span>Análise Eólica</span>
                </li>
                <li className="flex items-center space-x-2">
                  <TreePine className="w-4 h-4" />
                  <span>Conservação Ambiental</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/20 pt-8 text-center">
            <p className="text-sm text-white/60">
              © 2025 H2maps. Todos os direitos reservados. | Desenvolvido para um futuro sustentável.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

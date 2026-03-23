import React, { memo } from 'react';
import { motion as Motion } from 'framer-motion';
import { Github, ArrowRight } from 'lucide-react';

const ProjectCard = ({ project, index, onClick }) => {
    return (
        <Motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            onClick={onClick}
            className="group p-6 border border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer relative overflow-hidden"
            data-cursor="hover"
        >
            <div className="flex justify-between items-start mb-4">
                <Github className="text-zinc-500" size={20} />
                <Motion.div
                    className="text-zinc-500 group-hover:text-white group-hover:translate-x-0 transition-all duration-300 -translate-x-2 opacity-0 group-hover:opacity-100"
                >
                    <ArrowRight size={16} />
                </Motion.div>
            </div>
            <h3 className="text-xl font-serif text-white mb-2 group-hover:italic transition-all duration-300">{project.name}</h3>
            <p className="text-xs font-mono text-zinc-400 mb-4">{project.tech}</p>
            <p className="text-zinc-300 text-sm font-light leading-relaxed">{project.desc}</p>

            {/* Hover hint */}
            {/* <div className="absolute bottom-4 right-4 flex items-center gap-1.5 text-zinc-600 group-hover:text-zinc-400 transition-colors text-xs font-mono uppercase tracking-widest">
                <span>Ver detalle</span>
                <ArrowRight size={11} />
            </div> */}
        </Motion.div>
    )
}

export default memo(ProjectCard);


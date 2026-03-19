import React from 'react';
import { motion } from 'framer-motion';
import { Github, ArrowUpRight } from 'lucide-react';

const ProjectCard = ({ project, index }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="p-6 border border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            data-cursor="hover"
        >
            <div className="flex justify-between items-start mb-4">
                <Github className="text-zinc-500" size={20} />
                <ArrowUpRight className="text-zinc-500" size={16} />
            </div>
            <h3 className="text-xl font-serif text-white mb-2">{project.name}</h3>
            <p className="text-xs font-mono text-zinc-400 mb-4">{project.tech}</p>
            <p className="text-zinc-300 text-sm font-light leading-relaxed">{project.desc}</p>
        </motion.div>
    )
}

export default ProjectCard;

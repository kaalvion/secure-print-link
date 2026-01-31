import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars } from '@react-three/drei';


const FloatingShape = ({ position, color, speed }) => {
    const mesh = useRef();

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        mesh.current.rotation.x = Math.cos(t / 4 * speed) / 2;
        mesh.current.rotation.y = Math.sin(t / 4 * speed) / 2;
        mesh.current.rotation.z = Math.sin(t / 1.5 * speed) / 2;
        const factor = (1 + Math.sin(t / 1.5)) / 10;
        mesh.current.scale.setScalar(1 + factor);
    });

    return (
        <Float speed={speed * 2} rotationIntensity={1} floatIntensity={1}>
            <mesh ref={mesh} position={position}>
                <icosahedronGeometry args={[1, 0]} />
                <meshStandardMaterial
                    color={color}
                    roughness={0.1}
                    metalness={0.8}
                    transparent
                    opacity={0.6}
                />
            </mesh>
        </Float>
    );
};

const Background3D = () => {
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, background: 'var(--bg-dark)' }}>
            <Canvas camera={{ position: [0, 0, 8] }}>
                <fog attach="fog" args={['#0f172a', 5, 20]} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#3b82f6" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#f43f5e" />

                <FloatingShape position={[-3, 2, -2]} color="#3b82f6" speed={1.5} />
                <FloatingShape position={[3, -2, -1]} color="#8b5cf6" speed={2} />
                <FloatingShape position={[-1, -3, 0]} color="#f43f5e" speed={1.2} />

                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            </Canvas>
        </div>
    );
};

export default Background3D;

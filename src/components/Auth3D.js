import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera, ContactShadows, Environment, Text } from '@react-three/drei';


const SecureLock = (props) => {
    const mesh = useRef();

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        mesh.current.rotation.y = Math.sin(t / 2) * 0.3;
        mesh.current.position.y = Math.sin(t) * 0.2;
    });

    return (
        <group {...props} ref={mesh}>
            {/* Lock Body */}
            <mesh position={[0, -0.5, 0]}>
                <boxGeometry args={[2.5, 2, 0.8]} />
                <meshStandardMaterial color="#4f46e5" metalness={0.6} roughness={0.2} />
            </mesh>

            {/* Lock Shackle */}
            <mesh position={[0, 1, 0]}>
                <torusGeometry args={[0.8, 0.2, 16, 32, Math.PI]} />
                <meshStandardMaterial color="#fcd34d" metalness={1} roughness={0.1} />
            </mesh>

            {/* Cylinder vertical parts of shackle */}
            <mesh position={[-0.8, 1, 0]} rotation={[0, 0, 0]}>
                <cylinderGeometry args={[0.2, 0.2, 1, 32]} />
                <meshStandardMaterial color="#fcd34d" metalness={1} roughness={0.1} />
            </mesh>
            <mesh position={[0.8, 1, 0]} rotation={[0, 0, 0]}>
                <cylinderGeometry args={[0.2, 0.2, 1, 32]} />
                <meshStandardMaterial color="#fcd34d" metalness={1} roughness={0.1} />
            </mesh>

            {/* Keyhole */}
            <mesh position={[0, -0.5, 0.41]}>
                <circleGeometry args={[0.3, 32]} />
                <meshStandardMaterial color="#1e293b" />
            </mesh>
            <mesh position={[0, -0.8, 0.41]}>
                <planeGeometry args={[0.2, 0.4]} />
                <meshStandardMaterial color="#1e293b" />
            </mesh>
        </group>
    );
};

const Auth3D = () => {
    return (
        <Canvas>
            <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1.5} color="#6366f1" />
            <pointLight position={[-10, -10, -10]} intensity={1} color="#ec4899" />
            <spotLight position={[0, 5, 5]} angle={0.5} penumbra={1} intensity={1} castShadow />

            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <SecureLock position={[0, 0.5, 0]} />
                <Text
                    position={[0, -2.5, 0]}
                    fontSize={0.5}
                    color="#f8fafc"
                    anchorX="center"
                    anchorY="middle"
                    font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
                >
                    SECURE PRINT LINK
                </Text>
            </Float>

            <ContactShadows resolution={1024} scale={20} blur={2} opacity={0.25} far={10} color="#0b1739" />
            <Environment preset="city" />
        </Canvas>
    );
};

export default Auth3D;

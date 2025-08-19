import Beams from '@/components/auth/login-aside';
import SplitTextReveal from '@/components/auth/splite-text';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: Readonly<LoginProps>) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Log in" />

            {/* Split layout: desktop full-screen tanpa scroll */}
            <div className="grid min-h-[100svh] grid-cols-1 lg:h-screen lg:grid-cols-2 lg:overflow-hidden">
                {/* KIRI: Form login */}
                <div className="flex h-full items-center justify-center p-6 lg:overflow-hidden lg:p-12">
                    <div className="w-full max-w-md">
                        <AuthLayout title="Log in to your account" description="Enter your email and password below to log in">
                            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}

                            <form className="flex flex-col gap-6" onSubmit={submit}>
                                <div className="grid gap-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            required
                                            autoFocus
                                            tabIndex={0}
                                            autoComplete="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="email@example.com"
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="grid gap-2">
                                        <div className="flex items-center">
                                            <Label htmlFor="password">Password</Label>
                                            {canResetPassword && (
                                                <TextLink href={route('password.request')} className="ml-auto text-sm" tabIndex={0}>
                                                    Forgot password?
                                                </TextLink>
                                            )}
                                        </div>
                                        <Input
                                            id="password"
                                            type="password"
                                            required
                                            tabIndex={0}
                                            autoComplete="current-password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="Password"
                                        />
                                        <InputError message={errors.password} />
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Checkbox
                                            id="remember"
                                            name="remember"
                                            checked={data.remember}
                                            onCheckedChange={(checked) => setData('remember', Boolean(checked))}
                                            tabIndex={0}
                                        />
                                        <Label htmlFor="remember">Remember me</Label>
                                    </div>

                                    <Button type="submit" className="mt-4 w-full" tabIndex={0} disabled={processing}>
                                        {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                        Log in
                                    </Button>
                                </div>

                                <div className="text-center text-sm text-muted-foreground">
                                    {"Don't have an account? "}
                                    <TextLink href={route('register')} tabIndex={0}>
                                        Sign up
                                    </TextLink>
                                </div>
                            </form>
                        </AuthLayout>
                    </div>
                </div>

                {/* KANAN: Panel Beams + overlay text (lg+) */}
                <aside className="relative hidden h-full lg:block">
                    {/* Canvas Beams */}
                    <div className="absolute inset-0">
                        <div style={{ width: '100%', height: '100%', position: 'relative' }} aria-hidden="true">
                            <Beams
                                beamWidth={2}
                                beamHeight={15}
                                beamNumber={12}
                                lightColor="#200df1"
                                speed={2}
                                noiseIntensity={1.75}
                                scale={0.15}
                                rotation={0}
                            />
                        </div>
                    </div>

                    {/* Scrim tipis untuk keterbacaan teks (opsional, bisa dihapus) */}
                    <div className="absolute inset-0 bg-black/25" />

                    {/* Overlay teks */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="mx-auto max-w-xl px-8 text-center text-white">
                            <SplitTextReveal
                                text="cipta koding"
                                className="text-center text-2xl font-semibold lg:text-4xl"
                                delay={100}
                                duration={0.6}
                                ease="power3.out"
                                splitType="chars"
                                from={{ opacity: 0, y: 40 }}
                                to={{ opacity: 1, y: 0 }}
                                threshold={0.1}
                                rootMargin="-100px"
                                textAlign="center"
                                onLetterAnimationComplete={() => {
                                    console.log('SplitText animation selesai!');
                                }}
                            />

                            <p className="mt-3 text-white/80">Belajar, bangun, berdampak — satu baris kode setiap hari.</p>
                        </div>
                    </div>
                </aside>
            </div>
        </>
    );
}

'use client';

import { useCallback, useEffect, useState, useMemo, useRef } from "react";
import {of} from "effect/List";

interface LoginAttempt {
    timestamp: number;
    email: string;
}


// This hook manages login rate limiting by tracking login attempts and enforcing limits
export interface RateLimitOptions  {
    maxAttempts?: number , // default 5
    lockoutMs?: number;   // default 15 * 60 * 1000 (15 minutes)
    windowMs?: number;   // default  5 * 60 * 1000 (5 minutes)
    storageKey?: string; // default 'loginAttempts'
    rememberKey?: string; // default false
}

const DEFAULTS: Required<RateLimitOptions> = {
    maxAttempts: 5,
    lockoutMs: 15 * 60 * 1000, // 15 minutes
    windowMs: 5 * 60 * 1000, // 5 minutes
    storageKey: 'loginAttempts',
    rememberKey: 'rememberedEmail',
}

export function useLoginRateLimit(opts?: RateLimitOptions) {
    const { maxAttempts, lockoutMs, windowMs, storageKey, rememberKey } =  {...DEFAULTS, ...opts };
    const [attempts, setAttempts] = useState(<LoginAttempt[]>[]);
    const [isLocked, setIsLocked] = useState(false);
    const [LockoutEnd, setLockoutEnd] = useState<number | null>(null);
    const [remainingMs, setRemainingMs] = useState(0)
    const [rememberedEmail, setRememberedEmail] = useState<string>('');
    const [rememberMe, setRememberMe] = useState<boolean>(false)

    useEffect(() => {
        try {
            const savedAttempts = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;
            if (savedAttempts) {
                const parsed = JSON.parse(savedAttempts) as LoginAttempt[];
                setAttempts(parsed);
                checkLockout(parsed);
            }
        } catch (e) {
            if (typeof window !== 'undefined') localStorage.removeItem(storageKey);
        }
        // remember me
        if (typeof window !== 'undefined') {
            const savedEmail = localStorage.getItem(rememberKey);
            if (savedEmail) {
                setRememberedEmail(savedEmail);
                setRememberMe(true);
            }
        }
        // eslint-disable react-hooks/exhaustive-deps
    }, []);



    // countdown timer for lockout
    useEffect(() => {
        if (isLocked && LockoutEnd) {
            const interval = setInterval(() => {
                const now = Date.now();
                const remaining = LockoutEnd - now;
                if (remaining <= 0) {
                    setIsLocked(false);
                    setLockoutEnd(null);
                    setRemainingMs(0);
                    setAttempts([]);
                } else {
                    setRemainingMs(remaining);
                }
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [isLocked, LockoutEnd, storageKey]);

    const checkLockout = useCallback((attempts: LoginAttempt[]) => {
        const now = Date.now();
        const recentAttempts = attempts.filter(attempt => now - attempt.timestamp < windowMs);
        if (recentAttempts.length >= maxAttempts) {
            setIsLocked(true);
            setLockoutEnd(now + lockoutMs);
            setRemainingMs(lockoutMs);
        } else {
            setIsLocked(false);
            setLockoutEnd(null);
            setRemainingMs(0);
        }
    }, [maxAttempts, lockoutMs, windowMs]);

    const addFailedAttempt = useCallback((email: string) => {
        const next: LoginAttempt = {
            timestamp: Date.now(),
            email: email.toLowerCase() }
        const updated = [...attempts, next];
        setAttempts(updated);
        if (typeof window !== 'undefined') {
            localStorage.setItem(storageKey, JSON.stringify(updated));
        }
        checkLockout(updated);
    }, [attempts, storageKey, checkLockout]);

    const clearAttempts = useCallback(() => {
        setAttempts([]);
        if (typeof window !== 'undefined') localStorage.removeItem(storageKey);
    },  [storageKey]);

    const setRemember = useCallback((checked: boolean, email: string) => {
        setRememberMe(checked);
        if ( checked && email) {
            localStorage.setItem(rememberKey, email);
        } else {
            localStorage.removeItem(rememberKey);
            setRememberedEmail('');
        }
    }, [rememberKey]);

    const recentAttemptsForEmail = useCallback((email: string) => {
        const now = Date.now();
        const recent = attempts.filter(a => now - a.timestamp < windowMs && a.email.toLowerCase()) ;
        return { count: recent.length, remaining: Math.max(0, maxAttempts - recent.length) };
    }, [attempts, windowMs, maxAttempts]);

    return {
        // state
        isLocked,
        LockoutEnd,
        remainingMs,
        rememberedEmail,
        rememberMe,

        // actions
        addFailedAttempt,
        clearAttempts,
        setRemember,
        checkLockout,
        recentAttemptsForEmail,
    }

    }
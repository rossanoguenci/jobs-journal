"use client"

import {useEffect, useState} from 'react';
import {invoke} from '@tauri-apps/api/core';

export function useCheckReady(shouldCheck = true) {
    const [isChecking, setChecking] = useState(shouldCheck);
    const [isReady, setReady] = useState(false);

    useEffect(() => {
        if (!shouldCheck) return;

        invoke('check_ready')
            .then(() => setReady(true))
            .catch(console.error)
            .finally(() => setChecking(false));

    }, [shouldCheck]);

    return {isChecking, isReady};
}

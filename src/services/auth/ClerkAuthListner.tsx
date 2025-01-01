'use client'
import React, { useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { useAuth, useUser } from '@clerk/nextjs';
import { SelectUser } from '@/src/db/schema';
import { userStore } from '@/src/store/user/userStore';
import { SelectUserByExternalId } from '@/src/db/data-access/user/query';
import { UserResource } from '@clerk/types';
import { AuthUserAction } from '@/src/server-actions/User/AuthUserAction';

const ClerkAuthListener = () => {
  const { isSignedIn , isLoaded } = useAuth();
  const { user } = useUser();
  const setUser = useSetAtom(userStore.AuthUser);

	const handleSetUser = async (user: UserResource | null | undefined) => {
		if (!user) return
		const userRes = await AuthUserAction();
		if (!userRes) return
		setUser(userRes);
	};

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn && user) {
      handleSetUser(user)
        
    } else {
      setUser(null);
    }
  }, [isSignedIn, user, setUser]);

  return <></>;

};

export default ClerkAuthListener;
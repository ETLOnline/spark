'use client'
import React, { useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { useAuth, useUser } from '@clerk/nextjs';
import { SelectUser } from '@/src/db/schema';
import { userStore } from '@/src/store/user/userStore';
import { SelectUserById } from '@/src/db/data-access/user/query';
import { UserResource } from '@clerk/types';

const ClerkAuthListener: React.FC = () => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const setUser = useSetAtom(userStore.user);

	const handleSetUser = async (user: UserResource | null | undefined) => {
		if (!user) return
		const userRes = await SelectUserById(user.id);
		if (!userRes) return
		setUser(userRes);
	};

  useEffect(() => {
    if (isSignedIn && user) {
      handleSetUser(user)
        
    } else {
      setUser(null);
    }
  }, [isSignedIn, user, setUser]);

  return null;
};

export default ClerkAuthListener;
'use client';

import { useAuth, withAuth } from '@/lib/context/AuthContext';
import { UserType } from '@prisma/client';
import { CreatePostEditor } from '@/components/editor/CreatePostEditor';

const CreatePostPage: React.FC = () => {
  const { user } = useAuth();

  return <CreatePostEditor />;
};

export default withAuth(CreatePostPage, [UserType.BLOG_EDITOR]);
export const notificationEvent = (type: string, data: any) => {
    return {
      type,
      message: `Your post was ${type}d by ${data.username}`,
      postId: data.postId,
      fromUser: data.userId
    };
  };
  

  
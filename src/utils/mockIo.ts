const mockEmit = jest.fn();
const mockTo = jest.fn().mockReturnValue({ emit: mockEmit });

export const mockIo = {
  to: mockTo,
  emit: mockEmit,
};

export default mockIo;

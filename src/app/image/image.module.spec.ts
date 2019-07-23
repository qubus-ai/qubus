import { ImageModule } from './image.module';

describe('ImageModule', () => {
  let imageModule: ImageModule;

  beforeEach(() => {
    imageModule = new ImageModule();
  });

  it('should create an instance', () => {
    expect(imageModule).toBeTruthy();
  });
});

/**
 * Register the first-party primitive plugins (text/rectangle/image) into both the
 * ComponentDef registry (data) and the canvas-renderer registry (React). Call once
 * at editor entry. Idempotent. Adding a new object type = add one entry here + a
 * manifest + a renderer — no editor-core changes.
 */
import { registerComponent } from '@editor/component-registry';
import { registerCanvasRenderer } from './canvas-renderers/registry';
import { textComponent } from '@/data/library/plugins/text';
import { rectangleComponent } from '@/data/library/plugins/rectangle';
import { imageComponent } from '@/data/library/plugins/image';
import TextRenderer from './canvas-renderers/Text';
import RectangleRenderer from './canvas-renderers/Rectangle';
import ImageRenderer from './canvas-renderers/Image';

let initialized = false;

export function registerBuiltinComponents(): void {
  if (initialized) return;
  initialized = true;

  registerComponent(textComponent);
  registerCanvasRenderer('text', TextRenderer);

  registerComponent(rectangleComponent);
  registerCanvasRenderer('rectangle', RectangleRenderer);

  registerComponent(imageComponent);
  registerCanvasRenderer('image', ImageRenderer);
}

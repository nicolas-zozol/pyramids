import { registerPlugin } from './plugin-store.js';
import { PuppetsPluginModule } from './puppets-plugin.js';

export async function initBuiltInPlugins() {
  const pluginPaths = ['./text-content-plugin.js', './currency-plugin.js'];

  const plugins: Promise<PuppetsPluginModule>[] = pluginPaths.map((path) =>
    import(path).then((mod) => {
      if (!('default' in mod)) {
        throw new Error(`Plugin at path "${path}" is missing a default export`);
      }
      return mod as unknown as PuppetsPluginModule;
    }),
  );

  const modules = await Promise.all(plugins);

  modules.forEach((mod) => {
    if (!('default' in mod)) {
      throw new Error('Plugin module is missing default export');
    }

    const plugin = mod.default;
    registerPlugin(plugin.name, plugin);
  });
}

import type * as PageTree from 'fumadocs-core/page-tree';

function findFolder(nodes: PageTree.Node[], folderPath: string): PageTree.Folder | undefined {
  for (const node of nodes) {
    if (node.type !== 'folder') continue;
    if (node.$ref?.folder === folderPath) return node;
    const nested = findFolder(node.children, folderPath);
    if (nested) return nested;
  }
}

export function getTutorialTree(tree: PageTree.Root, domain: string, topic: string): PageTree.Root {
  const folderPath = `${domain}/${topic}`;
  const folder = findFolder(tree.children, folderPath);
  if (!folder) return tree;

  return {
    type: 'root',
    name: folder.name,
    description: folder.description,
    children: folder.children,
  };
}

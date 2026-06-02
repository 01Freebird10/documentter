export const compileKnowledgeGraph = (techStack, apiMap, dbOverview, features) => {
  const nodes = [];
  const edges = [];
  const processedNodes = new Set();

  const addNode = (id, label, type) => {
    if (processedNodes.has(id)) return;
    nodes.push({ id, label, type });
    processedNodes.add(id);
  };

  const addEdge = (source, target, label) => {
    edges.push({ source, target, label });
  };

  // 1. Seed Core Project Node
  addNode('project_core', 'RepoMind Project Core', 'core');

  // 2. Map Tech stack nodes
  techStack.forEach((t, idx) => {
    const id = `tech_${idx}`;
    addNode(id, t.name, 'technology');
    addEdge('project_core', id, 'uses_technology');
  });

  // 3. Map Database model nodes
  if (dbOverview && dbOverview.models) {
    addNode('db_dialect', dbOverview.dialect, 'database_engine');
    addEdge('project_core', 'db_dialect', 'interfaces_database');

    dbOverview.models.forEach((model, idx) => {
      const id = `model_${model.name.toLowerCase()}`;
      addNode(id, `${model.name} Schema`, 'db_model');
      addEdge('db_dialect', id, 'defines_schema');

      // Connect relations
      model.relations.forEach(rel => {
        const targetId = `model_${rel.toLowerCase()}`;
        addEdge(id, targetId, 'references');
      });
    });
  }

  // 4. Map Features nodes
  features.forEach((feat, idx) => {
    const id = `feat_${idx}`;
    addNode(id, feat.name, 'feature');
    addEdge('project_core', id, 'implements_capability');
  });

  // 5. Map API endpoints nodes
  apiMap.slice(0, 15).forEach((api, idx) => { // Maximum 15 endpoint nodes to prevent cluttering
    const id = `api_${idx}`;
    addNode(id, `${api.method} ${api.path}`, 'api_endpoint');
    
    // Express / routing gate links
    addEdge('project_core', id, 'exposes_gateway');
    
    // Connect Auth middleware features
    if (api.authRequired) {
      // Connect to Auth feature if it exists in features
      const authFeatIdx = features.findIndex(f => f.name === 'Authentication');
      if (authFeatIdx !== -1) {
        addEdge(id, `feat_${authFeatIdx}`, 'protected_by');
      }
    }
  });

  return {
    nodes,
    edges
  };
};

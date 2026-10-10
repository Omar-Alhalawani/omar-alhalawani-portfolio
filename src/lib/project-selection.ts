export const projectIds=['fifo','fpga-arithmetic','lumalink','mini-lysimeter','emg','cubex'] as const;
export type ProjectId=typeof projectIds[number];
export function selectProject(id:string) {
  if(!projectIds.includes(id as ProjectId))return;
  document.querySelectorAll<HTMLElement>('[data-project-world]').forEach(world=>{world.dataset.selected=id;});
  window.dispatchEvent(new CustomEvent('portfolio:project',{detail:id}));
}

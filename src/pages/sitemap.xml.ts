import type {APIRoute} from 'astro';
import {projects} from '../data/projects';
export const GET:APIRoute=({site})=>{
  const paths=['/','/experience','/projects',...projects.map(project=>`/projects/${project.id}`),'/about','/resume','/contact'];
  const xml=`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(path=>`<url><loc>${new URL(path,site).href.replace(/&/g,'&amp;')}</loc></url>`).join('')}</urlset>`;
  return new Response(xml,{headers:{'Content-Type':'application/xml; charset=utf-8'}});
};

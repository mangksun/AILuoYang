import { Request, Response, NextFunction } from 'express';
import * as ticketClient from '../services/ticketClient';

function normalizeTicket(ticket: any) {
  return {
    ...ticket,
    projectLimits: ticket.projectLimits ? JSON.parse(ticket.projectLimits) : [],
  };
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const tickets = await ticketClient.listTicketTypes({
      status: 'active',
      keyword: req.query.keyword,
      groupId: req.query.groupId,
      page: req.query.page || 1,
      pageSize: req.query.pageSize || 20,
    });

    const now = new Date();
    const list = (tickets.list || [])
      .filter((ticket: any) => !ticket.expireDate || new Date(ticket.expireDate) >= now)
      .map(normalizeTicket);

    res.json({
      code: 0,
      message: 'success',
      data: { ...tickets, list },
    });
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const ticket = await ticketClient.getTicketType(Number(req.params.id));

    if (ticket.status !== 'active') {
      res.status(404).json({ code: 404, message: '票种不存在或不可售', data: null });
      return;
    }

    if (ticket.expireDate && new Date(ticket.expireDate) < new Date()) {
      res.status(404).json({ code: 404, message: '票种已过期', data: null });
      return;
    }

    res.json({ code: 0, message: 'success', data: normalizeTicket(ticket) });
  } catch (err) {
    next(err);
  }
}

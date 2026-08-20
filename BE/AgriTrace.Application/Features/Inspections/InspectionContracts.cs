using AgriTrace.Domain.Contracts;
using MediatR;

namespace AgriTrace.Application.Features.Inspections;

public record GetInspectionsByBatchQuery(int BatchId) : IRequest<IReadOnlyList<InspectionDto>>;

public record GetInspectionByIdQuery(int InspectionId) : IRequest<InspectionDto>;

public record CreateInspectionCommand(
    int BatchId,
    int InspectorId,
    string Result,
    string? Notes) : IRequest<InspectionDto>;

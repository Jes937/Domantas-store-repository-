using Facet;

namespace Infrastructure;

[Facet (typeof(UserDB),nameof(UserDB.Password)) ]
public partial record UserSummary;

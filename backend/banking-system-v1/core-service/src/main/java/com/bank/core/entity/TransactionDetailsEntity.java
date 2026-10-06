package com.bank.core.entity;

import com.bank.core.enums.OperationCategory;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

/**
 * Дополнительные сведения об операции: категория и описание (например, название магазина).
 * Хранятся в отдельной таблице, чтобы не менять существующую таблицу транзакций.
 * Если записи нет — категория вычисляется по типу транзакции.
 */
@Entity
@Table(name = "transaction_details")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionDetailsEntity {

    @Id
    @JdbcTypeCode(SqlTypes.UUID)
    @Column(name = "transaction_id", nullable = false, columnDefinition = "uuid")
    private UUID transactionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 40)
    private OperationCategory category;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    @PreUpdate
    void touch() {
        updatedAt = Instant.now();
    }
}
